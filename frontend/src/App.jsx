import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api";

const CATEGORIAS_INGRESOS = ["Trabajo fijo", "Freelance", "Proyectos musicales", "Otros"];
const CATEGORIAS_GASTOS = ["Arriendo", "Comida", "Transporte", "Entretenimiento", "Servicios", "Música/Equipos", "Otros"];

const formatMonto = (monto) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(monto);

export default function App() {
  const [vista, setVista] = useState("dashboard");
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [resI, resG] = await Promise.all([
      axios.get(`${API}/ingresos/`),
      axios.get(`${API}/gastos/`),
    ]);
    setIngresos(resI.data);
    setGastos(resG.data);
  };

  const totalIngresos = ingresos.reduce((acc, i) => acc + i.monto, 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
  const balance = totalIngresos - totalGastos;

  return (
    <div style={styles.app}>
      {/* NAVBAR */}
      <nav style={styles.nav}>
        <h1 style={styles.navTitle}>💰 Mis Finanzas</h1>
        <div style={styles.navLinks}>
          {["dashboard", "ingresos", "gastos"].map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              style={{ ...styles.navBtn, ...(vista === v ? styles.navBtnActive : {}) }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <main style={styles.main}>
        {vista === "dashboard" && (
          <Dashboard
            totalIngresos={totalIngresos}
            totalGastos={totalGastos}
            balance={balance}
            ingresos={ingresos}
            gastos={gastos}
          />
        )}
        {vista === "ingresos" && (
          <Transacciones
            tipo="ingresos"
            datos={ingresos}
            categorias={CATEGORIAS_INGRESOS}
            onActualizar={cargarDatos}
          />
        )}
        {vista === "gastos" && (
          <Transacciones
            tipo="gastos"
            datos={gastos}
            categorias={CATEGORIAS_GASTOS}
            onActualizar={cargarDatos}
          />
        )}
      </main>
    </div>
  );
}

function Dashboard({ totalIngresos, totalGastos, balance, ingresos, gastos }) {
  return (
    <div>
      <h2 style={styles.titulo}>Resumen del mes</h2>
      <div style={styles.cards}>
        <Card label="Ingresos" monto={totalIngresos} color="#4ade80" />
        <Card label="Gastos" monto={totalGastos} color="#f87171" />
        <Card label="Balance" monto={balance} color={balance >= 0 ? "#60a5fa" : "#fb923c"} />
      </div>

      <div style={styles.listas}>
        <UltimosMovimientos titulo="Últimos ingresos" datos={ingresos.slice(0, 5)} color="#4ade80" />
        <UltimosMovimientos titulo="Últimos gastos" datos={gastos.slice(0, 5)} color="#f87171" />
      </div>
    </div>
  );
}

function Card({ label, monto, color }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={{ ...styles.cardMonto, color }}>{formatMonto(monto)}</p>
    </div>
  );
}

function UltimosMovimientos({ titulo, datos, color }) {
  return (
    <div style={styles.listaBox}>
      <h3 style={{ ...styles.listaTitulo, color }}>{titulo}</h3>
      {datos.length === 0 && <p style={styles.vacio}>Sin registros aún</p>}
      {datos.map((d) => (
        <div key={d.id} style={styles.listaItem}>
          <span>{d.descripcion}</span>
          <span style={{ color }}>{formatMonto(d.monto)}</span>
        </div>
      ))}
    </div>
  );
}

function Transacciones({ tipo, datos, categorias, onActualizar }) {
  const API_URL = `http://127.0.0.1:5000/api/${tipo}/`;
  const esIngreso = tipo === "ingresos";
  const color = esIngreso ? "#4ade80" : "#f87171";

  const [form, setForm] = useState({
    descripcion: "", monto: "", categoria: categorias[0], fecha: new Date().toISOString().split("T")[0], notas: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.descripcion || !form.monto) return alert("Completa descripción y monto");
    await axios.post(API_URL, { ...form, monto: parseFloat(form.monto) });
    setForm({ descripcion: "", monto: "", categoria: categorias[0], fecha: new Date().toISOString().split("T")[0], notas: "" });
    onActualizar();
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await axios.delete(`${API_URL}${id}`);
    onActualizar();
  };

  return (
    <div>
      <h2 style={styles.titulo}>{esIngreso ? "💵 Ingresos" : "💸 Gastos"}</h2>

      {/* FORMULARIO */}
      <div style={styles.form}>
        <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} style={styles.input} />
        <input name="monto" type="number" placeholder="Monto (CLP)" value={form.monto} onChange={handleChange} style={styles.input} />
        <select name="categoria" value={form.categoria} onChange={handleChange} style={styles.input}>
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input name="fecha" type="date" value={form.fecha} onChange={handleChange} style={styles.input} />
        <input name="notas" placeholder="Notas (opcional)" value={form.notas} onChange={handleChange} style={styles.input} />
        <button onClick={handleSubmit} style={{ ...styles.btn, backgroundColor: color }}>
          + Agregar {esIngreso ? "ingreso" : "gasto"}
        </button>
      </div>

      {/* LISTA */}
      <div style={styles.tabla}>
        {datos.length === 0 && <p style={styles.vacio}>Sin registros aún</p>}
        {datos.map((d) => (
          <div key={d.id} style={styles.filaTabla}>
            <div>
              <p style={styles.filaDesc}>{d.descripcion}</p>
              <p style={styles.filaMeta}>{d.categoria} · {d.fecha}</p>
              {d.notas && <p style={styles.filaNota}>{d.notas}</p>}
            </div>
            <div style={styles.filaRight}>
              <span style={{ color, fontWeight: "bold" }}>{formatMonto(d.monto)}</span>
              <button onClick={() => handleEliminar(d.id)} style={styles.btnEliminar}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  app: { minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", backgroundColor: "#1e293b", borderBottom: "1px solid #334155" },
  navTitle: { margin: 0, fontSize: "1.25rem", fontWeight: "bold" },
  navLinks: { display: "flex", gap: "0.5rem" },
  navBtn: { padding: "0.4rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "0.95rem" },
  navBtnActive: { backgroundColor: "#334155", color: "#f1f5f9" },
  main: { padding: "2rem", maxWidth: "900px", margin: "0 auto" },
  titulo: { marginBottom: "1.5rem", fontSize: "1.4rem" },
  cards: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" },
  card: { backgroundColor: "#1e293b", borderRadius: "12px", padding: "1.5rem", textAlign: "center" },
  cardLabel: { margin: "0 0 0.5rem", color: "#94a3b8", fontSize: "0.9rem" },
  cardMonto: { margin: 0, fontSize: "1.5rem", fontWeight: "bold" },
  listas: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  listaBox: { backgroundColor: "#1e293b", borderRadius: "12px", padding: "1.25rem" },
  listaTitulo: { margin: "0 0 1rem", fontSize: "1rem" },
  listaItem: { display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #334155", fontSize: "0.9rem" },
  vacio: { color: "#64748b", fontSize: "0.9rem" },
  form: { backgroundColor: "#1e293b", borderRadius: "12px", padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" },
  input: { padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#e2e8f0", fontSize: "0.9rem" },
  btn: { gridColumn: "span 2", padding: "0.7rem", borderRadius: "8px", border: "none", color: "#0f172a", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" },
  tabla: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  filaTabla: { backgroundColor: "#1e293b", borderRadius: "10px", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  filaDesc: { margin: "0 0 0.2rem", fontWeight: "500" },
  filaMeta: { margin: 0, fontSize: "0.8rem", color: "#64748b" },
  filaNota: { margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#94a3b8" },
  filaRight: { display: "flex", alignItems: "center", gap: "1rem" },
  btnEliminar: { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1rem" },
};