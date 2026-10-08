# 🛡️ Novatech Solutions - Laboratorio de QA & Pentesting en Vivo

Proyecto práctico y documento de investigación para las asignaturas de **Aseguramiento de la Calidad del Software** y **Auditoría y Seguridad**.

---

## 📌 Descripción del Proyecto

Este repositorio contiene una aplicación web corporativa completa (**Novatech Solutions**) desarrollada en Node.js y SQLite que simula un sistema sin controles de seguridad ni validaciones de QA, permitiendo a estudiantes y auditores realizar pruebas prácticas de vulnerabilidades y límites de entrada.

Asimismo, incluye una investigación académica formal de **20 páginas (Normas APA 7ª Edición)** sobre la integración del Aseguramiento de la Calidad y el Hacking Ético.

---

## 🚀 Inicio Rápido (Ejecución del Proyecto)

### Requisitos Previos
- Node.js (v18 o superior) instalado en el sistema.

### Pasos para Ejecutar
1. Clonar este repositorio o descargar la carpeta:
   ```bash
   git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   cd expo
   ```

2. Iniciar el servidor backend:
   ```bash
   node server.js
   ```

3. Abrir en el navegador:
   👉 `http://localhost:8080`

---

## 🎯 Vulnerabilidades Presentes en el Sistema

- **Ingeniería Social (OSINT):** Deducción de contraseña débil del sujeto objetivo (*Carlos Mendoza Silva* / `cmendoza@novatech.com` $\rightarrow$ `Rocky1985`).
- **Inyección SQL (SQLi Bypass):** Infiltración mediante `' OR 1=1 --` en el formulario de login.
- **Fuga de Información (Enumeración):** Respuestas de error diferenciadas al validar correos existentes vs inexistentes.
- **Pruebas de QA y Edge Cases:** Ausencia de validación en el formulario de registro (admite 500+ caracteres, emails sintácticamente inválidos y texto en números de teléfono).
- **Cross-Site Scripting (XSS Almacenado):** Renderizado de HTML/JS sin sanitizar (`<script>alert(1)</script>`) en la sección de biografía del perfil de usuario.
- **Exposición de Encabezados y Cookies:** Cabecera `Server` expuesta y cookies sin banderas `HttpOnly` / `Secure`.

---

## 📁 Estructura del Repositorio

```text
├── docs/
│   ├── investigacion_qa_pentesting_apa.md  # Investigación académica (Normas APA 7ª Ed.)
│   ├── guia_estudiante.md                 # Guía práctica para alumnos
│   ├── plantilla_reporte_bugs.md          # Formato estándar de reporte de defectos
│   ├── rubrica_evaluacion.md              # Rúbrica de evaluación (100%)
│   ├── codigo_etica.md                    # Reglas de compromiso y ética
│   └── guia_docente.md                    # Manual de montaje para el catedrático
├── app.js                                 # Lógica del cliente frontend
├── database.db                            # Base de datos SQLite inicializada
├── index.html                             # Interfaz web de Novatech Solutions
├── server.js                              # Servidor backend Node.js + SQLite
├── styles.css                             # Sistema de diseño CSS corporativo
└── README.md                              # Documentación del repositorio GitHub
```

---

## 📄 Documentación Académica

El documento de investigación completo se encuentra disponible en formato Markdown editable en [`docs/investigacion_qa_pentesting_apa.md`](docs/investigacion_qa_pentesting_apa.md).
