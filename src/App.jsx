import { useEffect, useMemo, useRef, useState } from "react";
import { companies as originalCompanies, STATUSES } from "./data/companies";

const STORAGE_KEY = "adarsh-company-application-tracker-v1";

const trackedCounters = ["Pending", "Replied", "Declined", "Sent", "Interview"];

const statusStyles = {
  Pending: "border-amber-200 bg-amber-50 text-amber-800",
  Replied: "border-sky-200 bg-sky-50 text-sky-800",
  Declined: "border-rose-200 bg-rose-50 text-rose-800",
  Interview: "border-indigo-200 bg-indigo-50 text-indigo-800",
  Sent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Follow Up": "border-orange-200 bg-orange-50 text-orange-800",
  "Not Applied": "border-slate-200 bg-slate-100 text-slate-700",
};

const emptyFilters = {
  query: "",
  status: "All",
  location: "All",
};

const normalizeCompany = (company, index) => ({
  id: Number(company.id) || index + 1,
  companyNumber: Number(company.companyNumber) || index + 1,
  companyName: company.companyName || "",
  roleTarget: company.roleTarget || "",
  location: company.location || "",
  companySize: company.companySize || "Unknown",
  website: company.website || "",
  linkedin: company.linkedin || "",
  basicInfo: company.basicInfo || "",
  appliedDate: company.appliedDate || "",
  status: STATUSES.includes(company.status) ? company.status : "Pending",
  emails: Array.isArray(company.emails) ? company.emails : [],
  notes: company.notes || "",
});

const mergeWithOriginalCompanies = (savedCompanies) => {
  if (!Array.isArray(savedCompanies) || savedCompanies.length === 0) {
    return originalCompanies;
  }

  const savedById = new Map(savedCompanies.map((company) => [Number(company.id), company]));
  const savedByName = new Map(
    savedCompanies.map((company) => [String(company.companyName || "").toLowerCase(), company]),
  );

  return originalCompanies.map((company, index) => {
    const saved = savedById.get(company.id) || savedByName.get(company.companyName.toLowerCase());
    return normalizeCompany(saved ? { ...company, ...saved } : company, index);
  });
};

const readStoredCompanies = () => {
  try {
    return mergeWithOriginalCompanies(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return originalCompanies;
  }
};

const buildSearchText = (company) =>
  [
    company.companyNumber,
    company.companyName,
    company.roleTarget,
    company.location,
    company.companySize,
    company.website,
    company.linkedin,
    company.basicInfo,
    company.appliedDate,
    company.status,
    company.emails.join(" "),
    company.notes,
  ]
    .join(" ")
    .toLowerCase();

const today = () => new Date().toISOString().slice(0, 10);

function App() {
  const fileInputRef = useRef(null);
  const [companies, setCompanies] = useState(readStoredCompanies);
  const [filters, setFilters] = useState(emptyFilters);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  }, [companies]);

  const locations = useMemo(() => {
    return [...new Set(companies.map((company) => company.location).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [companies]);

  const counts = useMemo(() => {
    return companies.reduce(
      (acc, company) => {
        acc.total += 1;
        acc[company.status] = (acc[company.status] || 0) + 1;
        return acc;
      },
      { total: 0 },
    );
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch = !query || buildSearchText(company).includes(query);
      const matchesStatus = filters.status === "All" || company.status === filters.status;
      const matchesLocation = filters.location === "All" || company.location === filters.location;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [companies, filters]);

  const updateStatus = (companyId, status) => {
    setCompanies((current) =>
      current.map((company) => {
        if (company.id !== companyId) return company;
        return {
          ...company,
          status,
          appliedDate: status === "Sent" && !company.appliedDate ? today() : company.appliedDate,
        };
      }),
    );
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(companies, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `application-tracker-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Exported the latest tracker JSON.");
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed.companies;

      if (!Array.isArray(list)) {
        throw new Error("JSON must be an array or an object with a companies array.");
      }

      setCompanies(list.map(normalizeCompany));
      setNotice(`Imported ${list.length} companies from JSON.`);
    } catch (error) {
      setNotice(`Import failed: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  };

  const resetData = () => {
    setCompanies(originalCompanies);
    setFilters(emptyFilters);
    setNotice("Reset to the original company list and outreach merge.");
  };

  return (
    <main className="min-h-screen px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Hero total={counts.total} sent={counts.Sent || 0} />

        <Stats counts={counts} />

        <section className="mt-6 rounded-[2rem] border border-white/70 bg-white/82 p-4 shadow-soft backdrop-blur sm:p-5">
          <Toolbar
            filters={filters}
            setFilters={setFilters}
            locations={locations}
            onExport={exportJson}
            onImport={() => fileInputRef.current?.click()}
            onReset={resetData}
            visibleCount={filteredCompanies.length}
            totalCount={companies.length}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={importJson}
          />

          {notice ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {notice}
            </div>
          ) : null}

          <CompanyTable companies={filteredCompanies} onStatusChange={updateStatus} />
          <CompanyCards companies={filteredCompanies} onStatusChange={updateStatus} />
        </section>
      </div>
    </main>
  );
}

function Hero({ total, sent }) {
  return (
    <header className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[#24352f] px-6 py-8 text-white shadow-soft sm:px-8 lg:px-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#e8c872]">
            Adarsh Pathania
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Company application tracker
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
            A searchable, editable tracker for every company in the outreach lists, merged with
            verified sent-email data from the existing markdown tracker.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-80">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm text-white/60">Companies</p>
            <p className="mt-1 text-3xl font-bold">{total}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm text-white/60">Already sent</p>
            <p className="mt-1 text-3xl font-bold">{sent}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Stats({ counts }) {
  const cards = [
    { label: "Total companies", value: counts.total || 0 },
    ...trackedCounters.map((status) => ({ label: status, value: counts[status] || 0 })),
  ];

  return (
    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-white/80 bg-white/78 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {card.label}
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{card.value}</p>
        </div>
      ))}
    </section>
  );
}

function Toolbar({
  filters,
  setFilters,
  locations,
  onExport,
  onImport,
  onReset,
  visibleCount,
  totalCount,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Search everything</span>
          <input
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="Company, role, location, email, status, notes..."
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
          />
        </label>

        <SelectField
          label="Status"
          value={filters.status}
          onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
          options={["All", ...STATUSES]}
        />

        <SelectField
          label="Location"
          value={filters.location}
          onChange={(value) => setFilters((current) => ({ ...current, location: value }))}
          options={["All", ...locations]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <p className="mr-auto text-sm font-medium text-slate-500 lg:mr-2">
          Showing {visibleCount} of {totalCount}
        </p>
        <button
          onClick={() => setFilters(emptyFilters)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Clear
        </button>
        <button
          onClick={onImport}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Import JSON
        </button>
        <button
          onClick={onExport}
          className="rounded-2xl bg-[#24352f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18241f]"
        >
          Export JSON
        </button>
        <button
          onClick={onReset}
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompanyTable({ companies, onStatusChange }) {
  return (
    <div className="mt-5 hidden overflow-hidden rounded-3xl border border-slate-200 bg-white xl:block">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-4 font-bold">#</th>
              <th className="px-4 py-4 font-bold">Company</th>
              <th className="px-4 py-4 font-bold">Role</th>
              <th className="px-4 py-4 font-bold">Location</th>
              <th className="px-4 py-4 font-bold">Size</th>
              <th className="px-4 py-4 font-bold">Applied</th>
              <th className="px-4 py-4 font-bold">Status</th>
              <th className="px-4 py-4 font-bold">Links</th>
              <th className="px-4 py-4 font-bold">Basic info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((company) => (
              <tr key={company.id} className="align-top transition hover:bg-slate-50/70">
                <td className="px-4 py-4 font-semibold text-slate-500">{company.companyNumber}</td>
                <td className="px-4 py-4">
                  <p className="font-bold text-slate-950">{company.companyName}</p>
                  <EmailList emails={company.emails} />
                </td>
                <td className="px-4 py-4 text-slate-700">{company.roleTarget}</td>
                <td className="px-4 py-4 text-slate-700">{company.location}</td>
                <td className="px-4 py-4 text-slate-600">{company.companySize || "Unknown"}</td>
                <td className="px-4 py-4 text-slate-600">{company.appliedDate || "-"}</td>
                <td className="px-4 py-4">
                  <StatusSelect company={company} onStatusChange={onStatusChange} />
                </td>
                <td className="px-4 py-4">
                  <LinkStack company={company} />
                </td>
                <td className="max-w-sm px-4 py-4 text-slate-600">
                  <p>{company.basicInfo}</p>
                  {company.notes ? <p className="mt-2 text-xs leading-5 text-slate-500">{company.notes}</p> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {companies.length === 0 ? <EmptyState /> : null}
    </div>
  );
}

function CompanyCards({ companies, onStatusChange }) {
  return (
    <div className="mt-5 grid gap-4 xl:hidden">
      {companies.map((company) => (
        <article key={company.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                #{company.companyNumber}
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-950">{company.companyName}</h2>
            </div>
            <StatusBadge status={company.status} />
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <InfoLine label="Role" value={company.roleTarget} />
            <InfoLine label="Location" value={company.location} />
            <InfoLine label="Size" value={company.companySize || "Unknown"} />
            <InfoLine label="Applied" value={company.appliedDate || "-"} />
          </div>

          <div className="mt-4">
            <StatusSelect company={company} onStatusChange={onStatusChange} />
          </div>

          <div className="mt-4">
            <LinkStack company={company} />
          </div>

          <EmailList emails={company.emails} />

          <p className="mt-4 text-sm leading-6 text-slate-600">{company.basicInfo}</p>
          {company.notes ? <p className="mt-2 text-xs leading-5 text-slate-500">{company.notes}</p> : null}
        </article>
      ))}
      {companies.length === 0 ? <EmptyState /> : null}
    </div>
  );
}

function StatusSelect({ company, onStatusChange }) {
  return (
    <select
      value={company.status}
      onChange={(event) => onStatusChange(company.id, event.target.value)}
      className={`w-full rounded-2xl border px-3 py-2 text-sm font-bold outline-none transition focus:ring-4 focus:ring-slate-200 ${
        statusStyles[company.status] || statusStyles.Pending
      }`}
    >
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${
        statusStyles[status] || statusStyles.Pending
      }`}
    >
      {status}
    </span>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function LinkStack({ company }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ExternalLink href={company.website} label="Website" />
      <ExternalLink href={company.linkedin} label="LinkedIn" />
    </div>
  );
}

function ExternalLink({ href, label }) {
  if (!href) {
    return (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-400">
        {label}: Unknown
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
    >
      {label}
    </a>
  );
}

function EmailList({ emails }) {
  if (!emails.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {emails.map((email) => (
        <a
          key={email}
          href={`mailto:${email}`}
          className="rounded-full bg-[#edf3ef] px-3 py-1 text-xs font-semibold text-[#355246] transition hover:bg-[#ddebe3]"
        >
          {email}
        </a>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-lg font-bold text-slate-900">No companies found</p>
      <p className="mt-2 text-sm text-slate-500">Try clearing filters or searching for something broader.</p>
    </div>
  );
}

export default App;
