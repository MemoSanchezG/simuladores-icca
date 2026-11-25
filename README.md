# Simuladores ICCA

Recurso educativo digital (REEDI) de la unidad de aprendizaje **Inteligencia centralizada contra amenazas**
(Licenciatura en Seguridad en Tecnologías de Información, FCFM, UANL).

Quince simuladores interactivos, uno por semana del curso, para practicar inteligencia de amenazas,
threat hunting con MITRE ATT&CK y Power BI (Power Query, modelado, DAX, diseño de dashboards y RLS).

**Sitio:** https://memosanchezg.github.io/simuladores-icca/

| Fase | Semanas | Tema |
|---|---|---|
| 1 | 1–5 | Fundamentos de CTI y Power BI desde cero |
| 2 | 6–10 | Entendiendo al adversario y entorno de investigación |
| 3 | 11–15 | Comunicando resultados, Power BI avanzado y PIA |

## Estructura

```
index.html            índice de semanas
assets/estilos.css    estilos comunes (claro/oscuro)
assets/comun.js       utilidades comunes (retroalimentación, progreso, gráficas SVG)
semana-01 … semana-15/index.html
```

Cada simulador es una página autocontenida: no usa librerías externas, funciona sin conexión
y todos los datos (IP, dominios, personas) son ficticios.
