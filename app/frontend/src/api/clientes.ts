import { apiClient } from "./client";
import { ICliente } from "../types/cliente";

export const MOCK_CLIENTES: ICliente[] = [
  {
    id_cliente: "cli-001",
    nit: "900.123.456-1",
    razon_social: "Metalúrgicas S.A.S",
    nombre_comercial: "Metalúrgicas S.A.S",
    codigo: "CJI-001245",
    direccion: "Cra 38 # 74-120",
    departamento: "Atlántico",
    municipio: "Barranquilla",
    barrio: "Betania",
    telefono: "300 123 4567",
    email: "contacto@metalurgicas.com",
    zona_nombre: "Atlántico Este",
    tipo_cliente_nombre: "Industrial",
    potencial_nombre: "Alto",
    estado_cliente_nombre: "Activo",
    frecuencia_visita_dias: 7,
    latitud: 10.9878,
    longitud: -74.7889,
    activo: true,
    contactos: [
      {
        id_contacto: "con-001",
        nombre: "Carlos Julio Mendoza",
        cargo: "Jefe de Compras",
        telefono: "300 123 4567",
        celular: "300 123 4567",
        email: "cmendoza@metalurgicas.com",
        principal: true,
      },
    ],
  },
  {
    id_cliente: "cli-002",
    nit: "900.234.567-2",
    razon_social: "Ferretería del Norte S.A.",
    nombre_comercial: "Ferretería del Norte",
    codigo: "CJI-001246",
    direccion: "Calle 84 # 42-15",
    departamento: "Atlántico",
    municipio: "Barranquilla",
    telefono: "310 987 6543",
    email: "ventas@ferrenorte.com",
    zona_nombre: "Atlántico Norte",
    tipo_cliente_nombre: "Distribuidor",
    potencial_nombre: "Medio",
    estado_cliente_nombre: "Activo",
    frecuencia_visita_dias: 15,
    latitud: 11.0045,
    longitud: -74.8192,
    activo: true,
    contactos: [
      {
        id_contacto: "con-002",
        nombre: "Andrés Felipe Gómez",
        cargo: "Gerente General",
        telefono: "310 987 6543",
        email: "agomez@ferrenorte.com",
        principal: true,
      },
    ],
  },
  {
    id_cliente: "cli-003",
    nit: "900.345.678-3",
    razon_social: "Aceros del Caribe Ltda.",
    nombre_comercial: "Aceros del Caribe",
    codigo: "CJI-001247",
    direccion: "Vía 40 # 65-200",
    departamento: "Atlántico",
    municipio: "Barranquilla",
    telefono: "315 456 7890",
    email: "ventas@acerosdelcaribe.com",
    zona_nombre: "Atlántico Centro",
    tipo_cliente_nombre: "Industrial",
    potencial_nombre: "Alto",
    estado_cliente_nombre: "Activo",
    latitud: 10.9754,
    longitud: -74.7721,
    activo: true,
  },
  {
    id_cliente: "cli-004",
    nit: "900.456.789-4",
    razon_social: "Soluciones Industriales de la Costa",
    nombre_comercial: "Soluciones Industriales",
    codigo: "CJI-001248",
    direccion: "Cra 21 # 30-45",
    departamento: "Atlántico",
    municipio: "Soledad",
    telefono: "320 123 9988",
    email: "contacto@solucionescosta.com",
    zona_nombre: "Atlántico Sur",
    tipo_cliente_nombre: "Industrial",
    potencial_nombre: "Medio",
    estado_cliente_nombre: "Activo",
    latitud: 10.9182,
    longitud: -74.7645,
    activo: true,
  },
  {
    id_cliente: "cli-005",
    nit: "900.567.890-5",
    razon_social: "ConstruInnova S.A.S",
    nombre_comercial: "ConstruInnova",
    codigo: "CJI-001249",
    direccion: "Calle 30 # 12-50",
    departamento: "Atlántico",
    municipio: "Soledad",
    telefono: "301 777 8899",
    email: "contacto@construinnova.com",
    zona_nombre: "Atlántico Este",
    tipo_cliente_nombre: "Industrial",
    potencial_nombre: "Alto",
    estado_cliente_nombre: "Activo",
    latitud: 10.9234,
    longitud: -74.7556,
    activo: true,
    contactos: [
      {
        id_contacto: "con-005",
        nombre: "Carlos Julio Mendoza",
        cargo: "Director de Obras",
        telefono: "301 777 8899",
        email: "cmendoza@construinnova.com",
        principal: true,
      },
    ],
  },
  {
    id_cliente: "cli-006",
    nit: "900.678.901-6",
    razon_social: "Distribuciones JM del Atlántico",
    nombre_comercial: "Distribuciones JM",
    codigo: "CJI-001250",
    direccion: "Cra 5 # 18-60",
    departamento: "Atlántico",
    municipio: "Malambo",
    telefono: "318 444 3322",
    email: "gerencia@distribucionesjm.com",
    zona_nombre: "Atlántico Sur",
    tipo_cliente_nombre: "Distribuidor",
    potencial_nombre: "Medio",
    estado_cliente_nombre: "Activo",
    latitud: 10.8621,
    longitud: -74.7733,
    activo: true,
  },
  {
    id_cliente: "cli-007",
    nit: "900.789.012-7",
    razon_social: "Ferretería La 14 Comercial",
    nombre_comercial: "Ferretería La 14",
    codigo: "CJI-001251",
    direccion: "Calle 16 # 9-30",
    departamento: "Atlántico",
    municipio: "Malambo",
    telefono: "317 222 1100",
    email: "ventas@ferreteriala14.com",
    zona_nombre: "Atlántico Sur",
    tipo_cliente_nombre: "Retail",
    potencial_nombre: "Bajo",
    estado_cliente_nombre: "Activo",
    latitud: 10.8589,
    longitud: -74.7801,
    activo: true,
  },
  // Extra clients for the Picker panel in diseno_04.png
  {
    id_cliente: "cli-008",
    nit: "900.890.123-8",
    razon_social: "Induacero S.A.S",
    nombre_comercial: "Induacero S.A.S",
    codigo: "CJI-001252",
    direccion: "Cra 50 # 80-10",
    departamento: "Atlántico",
    municipio: "Barranquilla",
    telefono: "302 334 5566",
    email: "contacto@induacero.com",
    tipo_cliente_nombre: "Industrial",
    potencial_nombre: "Alto",
    estado_cliente_nombre: "Activo",
    latitud: 11.0012,
    longitud: -74.8055,
    activo: true,
  },
  {
    id_cliente: "cli-009",
    nit: "900.901.234-9",
    razon_social: "Ferretería Central de la Costa",
    nombre_comercial: "Ferretería Central",
    codigo: "CJI-001253",
    direccion: "Calle 45 # 30-20",
    departamento: "Atlántico",
    municipio: "Barranquilla",
    telefono: "311 445 6677",
    email: "ventas@ferreteriacentral.com",
    tipo_cliente_nombre: "Distribuidor",
    potencial_nombre: "Medio",
    estado_cliente_nombre: "Activo",
    latitud: 10.9623,
    longitud: -74.7934,
    activo: true,
  },
  {
    id_cliente: "cli-010",
    nit: "900.012.345-0",
    razon_social: "Prodeco Ltda.",
    nombre_comercial: "Prodeco Ltda.",
    codigo: "CJI-001254",
    direccion: "Zona Industrial Soledad Lote 5",
    departamento: "Atlántico",
    municipio: "Soledad",
    telefono: "304 556 7788",
    email: "compras@prodeco.com",
    tipo_cliente_nombre: "Industrial",
    potencial_nombre: "Alto",
    estado_cliente_nombre: "Activo",
    latitud: 10.9345,
    longitud: -74.7489,
    activo: true,
  },
  {
    id_cliente: "cli-011",
    nit: "900.123.999-1",
    razon_social: "Suministros del Caribe S.A.S",
    nombre_comercial: "Suministros del Caribe",
    codigo: "CJI-001255",
    direccion: "Calle 10 # 5-40",
    departamento: "Atlántico",
    municipio: "Malambo",
    telefono: "316 667 8899",
    email: "info@suministroscaribe.com",
    tipo_cliente_nombre: "Distribuidor",
    potencial_nombre: "Medio",
    estado_cliente_nombre: "Activo",
    latitud: 10.8711,
    longitud: -74.7712,
    activo: true,
  },
  {
    id_cliente: "cli-012",
    nit: "900.234.888-2",
    razon_social: "Comercializadora J&J Ltda.",
    nombre_comercial: "Comercializadora J&J",
    codigo: "CJI-001256",
    direccion: "Km 3 Vía Galapa",
    departamento: "Atlántico",
    municipio: "Galapa",
    telefono: "321 778 9900",
    email: "gerencia@comercializadorajj.com",
    tipo_cliente_nombre: "Industrial",
    potencial_nombre: "Alto",
    estado_cliente_nombre: "Activo",
    latitud: 10.8956,
    longitud: -74.8891,
    activo: true,
  },
];

export const getClientes = async (params?: {
  zona?: string;
  tipo?: string;
  potencial?: string;
  search?: string;
  municipio?: string;
}): Promise<ICliente[]> => {
  try {
    const res = await apiClient.get<ICliente[]>("/clientes", { params });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    throw new Error("Fallback to mock");
  } catch {
    let result = [...MOCK_CLIENTES];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.nombre_comercial.toLowerCase().includes(q) ||
          c.codigo.toLowerCase().includes(q) ||
          c.nit.toLowerCase().includes(q),
      );
    }
    if (params?.tipo && params.tipo !== "Todos") {
      result = result.filter((c) => c.tipo_cliente_nombre === params.tipo);
    }
    if (params?.municipio && params.municipio !== "Todos") {
      result = result.filter((c) => c.municipio === params.municipio);
    }
    return result;
  }
};

export const getClienteById = async (
  id: string,
): Promise<ICliente | undefined> => {
  try {
    const res = await apiClient.get<ICliente>(`/clientes/${id}`);
    if (res.data && typeof res.data === "object" && "id_cliente" in res.data) {
      return res.data;
    }
    throw new Error("Fallback to mock");
  } catch {
    return MOCK_CLIENTES.find(
      (c) =>
        c.id_cliente === id ||
        c.nombre_comercial.toLowerCase().includes(id.toLowerCase()),
    );
  }
};

export const crearCliente = async (
  nuevo: Partial<ICliente>,
): Promise<ICliente> => {
  const cliente: ICliente = {
    id_cliente: `cli-${Date.now()}`,
    nit: nuevo.nit || "900.999.888-1",
    razon_social: nuevo.razon_social || "Nueva Empresa S.A.S",
    nombre_comercial:
      nuevo.nombre_comercial || nuevo.razon_social || "Nueva Empresa S.A.S",
    codigo:
      nuevo.codigo || `CJI-${Math.floor(100000 + Math.random() * 900000)}`,
    direccion: nuevo.direccion || "Calle 100 # 50-20",
    departamento: nuevo.departamento || "Atlántico",
    municipio: nuevo.municipio || "Barranquilla",
    telefono: nuevo.telefono || "300 000 0000",
    email: nuevo.email || "contacto@empresa.com",
    zona_nombre: nuevo.zona_nombre || "Atlántico Centro",
    tipo_cliente_nombre: nuevo.tipo_cliente_nombre || "Industrial",
    potencial_nombre: nuevo.potencial_nombre || "Alto",
    estado_cliente_nombre: "Activo",
    latitud: nuevo.latitud || 10.98 + (Math.random() - 0.5) * 0.05,
    longitud: nuevo.longitud || -74.79 + (Math.random() - 0.5) * 0.05,
    activo: true,
    contactos: nuevo.contactos || [
      {
        id_contacto: `con-${Date.now()}`,
        nombre: "Contacto Comercial",
        cargo: "Encargado de Compras",
        telefono: nuevo.telefono || "300 000 0000",
        email: nuevo.email || "contacto@empresa.com",
        principal: true,
      },
    ],
  };

  try {
    const primaryContact = nuevo.contactos?.[0];
    const payload = {
      nit: cliente.nit,
      razon_social: cliente.razon_social,
      nombre_comercial: cliente.nombre_comercial,
      direccion: cliente.direccion,
      departamento: cliente.departamento,
      municipio: cliente.municipio,
      telefono: cliente.telefono,
      email: cliente.email,
      zona: nuevo.zona_nombre || "NORTE",
      tipo_cliente: nuevo.tipo_cliente_nombre || "Industrial",
      potencial: nuevo.potencial_nombre || "Alto",
      estado_cliente: nuevo.estado_cliente_nombre || "Activo",
      latitud: nuevo.latitud,
      longitud: nuevo.longitud,
      contacto_nombre: primaryContact?.nombre || "Contacto Comercial",
      contacto_cargo: primaryContact?.cargo,
      contacto_telefono: primaryContact?.telefono,
      contacto_email: primaryContact?.email,
    };
    const res = await apiClient.post<ICliente>("/clientes", payload);
    MOCK_CLIENTES.unshift(res.data);
    return res.data;
  } catch {
    MOCK_CLIENTES.unshift(cliente);
    return cliente;
  }
};

export interface ImportSummary {
  total_filas: number;
  creados: number;
  actualizados: number;
  errores: { fila: number; motivo: string }[];
  adjunto_id?: number | null;
}

export const importarClientes = async (file: File): Promise<ImportSummary> => {
  const formData = new FormData();
  formData.append("archivo", file);
  const res = await apiClient.post<ImportSummary>(
    "/clientes/importar",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
};

export const descargarPlantilla = async (): Promise<Blob> => {
  const res = await apiClient.get("/clientes/plantilla", {
    responseType: "blob",
  });
  return res.data;
};

export interface ClienteHistorialItem {
  id_historial: number;
  id_cliente: number | string;
  fecha: string;
  accion: string;
  usuario: string;
  descripcion: string | null;
}

const DEFAULT_HISTORIAL_MOCK: ClienteHistorialItem[] = [
  {
    id_historial: 3,
    id_cliente: "cli-001",
    fecha: "2024-05-14T10:30:00Z",
    accion: "Visita realizada",
    usuario: "Juan Pérez",
    descripcion: "Resultado: Interesado",
  },
  {
    id_historial: 2,
    id_cliente: "cli-001",
    fecha: "2024-05-07T09:15:00Z",
    accion: "Cotización enviada",
    usuario: "Juan Pérez",
    descripcion: "COT-1241 | $ 12,600,000",
  },
  {
    id_historial: 1,
    id_cliente: "cli-001",
    fecha: "2024-04-30T15:00:00Z",
    accion: "Seguimiento telefónico",
    usuario: "Juan Pérez",
    descripcion: "Pendiente de respuesta",
  },
];

export const getClienteHistorial = async (
  clienteId?: string | number,
  limit = 3,
): Promise<ClienteHistorialItem[]> => {
  if (!clienteId) return DEFAULT_HISTORIAL_MOCK.slice(0, limit);
  const numericId = Number(String(clienteId).replace(/\D/g, ""));
  if (!numericId) return DEFAULT_HISTORIAL_MOCK.slice(0, limit);

  try {
    const res = await apiClient.get<ClienteHistorialItem[]>(
      `/clientes/${numericId}/historial`,
      { params: { limit } },
    );
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return DEFAULT_HISTORIAL_MOCK.slice(0, limit);
  } catch {
    return DEFAULT_HISTORIAL_MOCK.slice(0, limit);
  }
};
