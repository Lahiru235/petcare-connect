import { useEffect, useState } from "react";
import { adminApi } from "../../api/services";
import { Empty, Field, Loader, Stat, addDays, prettyDate, todayStr } from "../../components/UI";

const Reports = () => {
  const [range, setRange] = useState({ from: addDays(-30), to: addDays(30) });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.reports(range).then(({ data }) => setReport(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [range.from, range.to]);

  const exportCsv = () => {
    const rows = [["Veterinarian", "Total", "Completed", "No-show"]];
    report.byDoctor.forEach((d) => rows.push([d.doctor, d.total, d.completed, d.noShow]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `petcare-report-${range.from}-to-${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !report) return <Loader />;

  const maxDay = Math.max(1, ...report.byDay.map((d) => d.count));
  const maxVet = Math.max(1, ...report.byDoctor.map((d) => d.total));

  return (
    <>
      <div className="card-head page-head">
        <div>
          <h1>Reports</h1>
          <p className="muted">Appointment volume and no-show rate for the chosen period.</p>
        </div>
        <div className="row-actions">
          <input type="date" style={{ width: 160 }} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          <input type="date" style={{ width: 160 }} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          <button className="btn btn-ghost btn-sm" onClick={exportCsv}>Download CSV</button>
        </div>
      </div>

      <div className="stat-grid">
        <Stat value={report.total} label="Appointments in range" />
        <Stat value={report.byStatus.Completed || 0} label="Completed" tone="sky" />
        <Stat value={report.byStatus.Cancelled || 0} label="Cancelled" tone="accent" />
        <Stat value={`${report.noShowRate}%`} label="No-show rate" tone="warn" />
      </div>

      <div className="card">
        <h2>Volume by day</h2>
        {report.byDay.length === 0 ? <Empty title="No appointments in this range" /> : report.byDay.map((d) => (
          <div className="bar-row" key={d.date}>
            <span className="small muted">{prettyDate(d.date)}</span>
            <div className="bar" style={{ width: `${(d.count / maxDay) * 100}%` }} />
            <span className="small">{d.count}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Load per veterinarian</h2>
        {report.byDoctor.length === 0 ? <Empty title="Nothing to show" /> : report.byDoctor.map((d) => (
          <div className="bar-row" key={d.doctor}>
            <span className="small">Dr. {d.doctor}</span>
            <div className="bar accent" style={{ width: `${(d.total / maxVet) * 100}%` }} />
            <span className="small">{d.total}</span>
          </div>
        ))}
        <p className="small muted" style={{ marginTop: ".8rem" }}>
          Period {prettyDate(range.from)} — {prettyDate(range.to)}. Generated {prettyDate(todayStr())}.
        </p>
      </div>
    </>
  );
};

export default Reports;
