error con react-chartjs-2; 

ajuste en webpack para que no intente cargar jimu-core/react/jsx-runtime.js (ruta que no existe), y validar build para confirmar. Luego te dejo la opción recomendada entre seguir con chartjs o usar el componente nativo SVG.

Voy a aplicar el fix de raíz: quitar la externalización de react/jsx-runtime hacia jimu-core (que hoy produce el 404) y alinear indicadores2 para usar React desde jimu-core, reduciendo conflictos de instancia. Luego compilo para validar.

Compacted conversation

La compilación ya pasó y confirmé que el bundle de indicadores2 dejó de referenciar jimu-core/react/jsx-runtime. Voy a guardar una nota corta en memoria del repositorio con esta causa raíz para futuras incidencias similares.

Sí, hay forma de solucionarlo, y ya apliqué el ajuste en código para atacar la causa raíz del 404.

Qué cambié

Quité la externalización de react/jsx-runtime y react/jsx-dev-runtime en webpack para que no apunten a una ruta que ExB no sirve.
webpack.common.js
Alineé el widget indicadores2 para usar React desde jimu-core y evitar mezcla de fuentes de React en runtime.
widget.tsx
Verificación ejecutada

Diagnóstico de TypeScript/lint en archivos tocados: sin errores.
Build completo de desarrollo:
npm run build:dev compiló correctamente, incluyendo widgets/indicadores2.
Inspección del bundle generado de indicadores2:
Ya no aparecen referencias a jimu-core/react/jsx-runtime ni jimu-core/react/jsx-dev-runtime (que eran las que disparaban el 404).
Resultado
El error persistente de jimu-core/react/jsx-runtime.js 404 al usar react-chartjs-2 queda corregido desde el empaquetado/runtime mapping.

La anterior confoiguracin del webpack.common es
arcgis-experience-builder-1.19\client\webpack\webpack.common copy.js