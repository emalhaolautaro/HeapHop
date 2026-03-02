Este es el README.md diseñado para ser tan profesional y minimalista como la propia aplicación. Está pensado para presentar HeapHop como una herramienta de ingeniería de precisión para tu tesis en la UNS.
🐇 HeapHop
High-Performance Memory Profiler & Benchmarking Suite

HeapHop es una herramienta de diagnóstico de memoria de grado de ingeniería diseñada para analizar, visualizar y comparar la eficiencia de gestión de recursos en lenguajes de sistemas y entornos gestionados. Desarrollada bajo una arquitectura modular y minimalista, esta aplicación actúa como el puente práctico para una investigación teórica sobre la fragmentación y el rendimiento de bajo nivel.
🚀 Propósito Central

El objetivo de HeapHop es proporcionar una visión profunda y en tiempo real de cómo el software interactúa con la memoria física y la jerarquía de caché. A diferencia de los monitores genéricos, HeapHop se especializa en la detección de la fragmentación del heap y la eficiencia de los allocators en lenguajes como Rust, C++ y Java.
🛠️ Características Principales
1. Análisis en Tiempo Real (The Observatory)

    RSS vs. Heap Tracking: Visualización continua del Resident Set Size frente a la memoria asignada.

    Fragmentation Heatmap: Un mapa de calor dinámico que utiliza un canvas de alta resolución para representar eventos de malloc y free, visualizando el "efecto queso suizo" de la fragmentación.

    Hardware Synergy: Monitoreo de métricas críticas de hardware, incluyendo Cache Misses (L1/L2/L3) y Page Faults.

2. Laboratorio de Experimentos (The Lab Setup)

    Command Factory: Configuración transparente de ejecuciones mediante la selección de compiladores y niveles de optimización (O0-O3).

    Multi-Language Support: Soporte nativo para comparar el comportamiento de Rust, C++ y Java bajo las mismas condiciones de hardware.

3. Contexto Académico (Theory Integration)

    Micropills: Integración de conceptos teóricos sobre gestión de memoria dentro de la interfaz para validar el análisis técnico.

    History & Battle Mode: Persistencia de resultados en formato JSON para realizar comparativas delta (Δ) entre distintas optimizaciones.

## 📊 Mediciones y Métricas

HeapHop recopila información tanto desde la perspectiva del código fuente (eBPF) como desde la perspectiva del Hardware/OS. Aquí te explicamos qué significa cada una:

### Memoria y Asignaciones
- **Total Allocated:** La suma exacta (en Bytes/MB) de todas las peticiones de memoria que el programa le hizo al sistema operativo mediante funciones como `malloc()` o instanciación de objetos. 
  > *`Total Allocated = Σ (size_of_each_malloc)`*
- **Virtual Memory:** Todo el espacio de direcciones que el kernel de Linux le reservó tácitamente al proceso. Esto incluye código pre-cargado, bibliotecas dinámicas compartidas y memoria prometida pero aún no mapeada a nivel físico.
  > *Obtenida vía Telemetría `/proc/[pid]/statm` (tamaño total).*
- **Memory Pressure (RSS - Resident Set Size):** La memoria física, eléctrica y real que el programa está ocupando en los chips de tu memoria RAM. Suele ser mayor que el "Total Allocated" porque incluye el peso estructural del propio lenguaje (como el intérprete de Python o el recolector de basura de Java) y menor que "Virtual Memory" porque no todo el espacio reservado se escribe inmediatamente.
  > *Obtenida vía Telemetría `/proc/[pid]/statm` (páginas residentes × tamaño de página).*

### Eficiencia y Comportamiento Temporal
- **Total Calls:** Cantidad de veces que el programa le suplicó al OS un nuevo pedazo de memoria (`malloc`, `calloc`, `realloc`).
  > *`Total Calls = COUNT(malloc_events)`*
- **Avg Lifespan:** Tiempo promedio (en milisegundos) que sobrevive un bloque de memoria desde que el programa lo pide hasta que lo devuelve (`free()`). Ayuda a distinguir objetos temporales de variables globales.
  > *`Avg Lifespan = Σ (time_of_free - time_of_malloc) / COUNT(completed_lifespans)`*
- **Freed Ratio:** Porcentaje de llamadas `free` vs `malloc`. Un ratio del 0% al final de la ejecución indica una fuga de memoria (*memory leak*). Un 100% indica una gestión perfecta. En lenguajes como Python o Java, el GC puede disparar este ratio si limpia objetos que fueron instanciados antes del monitoreo.
  > *`Freed Ratio = MIN(100%, (COUNT(free_events) / COUNT(malloc_events)) * 100)`*
- **Block Size Distribution:** Muestra un histograma clasificando todas las reservas de memoria según su tamaño (pequeñas `<1KB`, medianas `<1MB`, grandes `>1MB`). Es vital para identificar patrones de asignación y predecir niveles de fragmentación (*memory fragmentation*).
  > *Histograma de frecuencias: `COUNT(malloc_events)` agrupados por Bytes*
- **Mmap / Munmap Calls:** Cantidad de llamadas directas a `mmap` y `munmap` del sistema operativo. Estas se disparan al pedir bloques gigantes de memoria (generalmente `>128KB` dependiendo de la implementación de libc) o cuando los lenguajes dinámicos (como Java o Go) inicializan grandes arenas para sus propios recolectores de basura. 
  > *Estas medidas están intencionalmente separadas del recuento de `malloc`/`free`. La justificación de aislar esto radica en una limitación de rastreo eBPF en distribuciones GNU/Linux recientes donde las llamadas de liberación por `munmap` causan asimetrías severas si se cuentan bajo el abanico de un solo `free`, resultando en un "Freed Ratio" superior al 100%.*

### Rendimiento del Metal
- **Page Faults:** Ocurren cuando el programa intenta escribir en memoria Virtual que el OS le había prometido, pero que aún no le había asignado físicamente en la RAM (Demand Paging). Un número muy alto de Page Faults puede indicar *thrashing* o una inicialización muy costosa.
  > *Obtenida vía syscall del sistema (Major + Minor faults).*

### Huella del Artefacto
Esta métrica determina el peso estático generado por el compilador. **Solamente se calcula para lenguajes no gestionados (como C o Rust)** que producen binarios nativos (Ahead-of-Time). En lenguajes interpretados o con máquina virtual (como Python o Java), el tamaño del código fuente no es representativo frente al peso estructural del *runtime*, por lo que deliberadamente se marca como N/A en el Dashboard para educar sobre la diferencia estructural entre lenguajes.

- **Binary Size (stripped):** Tamaño del ejecutable una vez removidos los símbolos de debug. Es el peso real que ocuparía en un sistema embebido o en un servidor en producción.
  > *Obtenido vía `strip --strip-all` sobre una copia del binario + metadata del OS.*
- **Code Size (.text):** Peso exclusivo de las instrucciones ejecutables, sin datos ni metadata. Es literalmente lo que entra en la memoria flash de un microcontrolador.
  > *Obtenido extrayendo la sección `.text` vía comando `size` de Linux.*
- **Data Size (.data + .bss):** Memoria estática que el programa necesita antes de ejecutar la primera instrucción (variables globales, constantes, buffers pre-asignados).
  > *Obtenido sumando las secciones `.data` y `.bss` vía comando `size` de Linux.*

### Garbage Collection (Lenguajes Gestionados)
En perfiles `Gc` o `Interpreter`, se desactiva el análisis profundo de EBPF y se reportan exclusivamente las pausas que inyecta la recolección automática en el hilo de ejecución:
- **GC Cycles:** Cantidad de veces que el recolector purgó memoria.
- **Max / Avg / Total Pause:** El costo temporal (en milisegundos) que el programa estuvo congelado ("Stop-The-World") realizando contabilidad y limpieza.
- **Std Dev:** La desviación estándar de esas pausas. Pausas con alta desviación causan "jitter" y micro-tartamudeos impredecibles.
- **Overhead:** Porcentaje del tiempo total de la ejecución del script/programa que se gastó puramente purgando basura (Total Pause / CPU Time * 100).
- **Heap Before / After:** La medición exacta de memoria "Viva" justo antes y justo después de un barrido de recolección.
- **Python Current & Peak (tracemalloc):** Como Python recolecta distinto, "Current" marca la memoria asignada activa al instante en que terminó el script, y "Peak" captura el pico histórico de RAM más alto en todo su ciclo de vida.

### Concurrencia y Context Switches
Registra cuán eficientemente interactúa el programa multicore con el Scheduler del OS:
- **Threads / Peak:** Hilos de ejecución activos lanzados por el programa vs el máximo alcanzado.
- **Voluntary Switches:** Las veces que un hilo le cedió el procesador al SO voluntariamente (ej: al hacer un *sleep*, esperar una lectura de archivo I/O o un lock).
- **Nonvoluntary (Forced) Switches:** Las interrupciones agresivas (Preemption) donde el OS "desalojó" forzosamente al hilo porque consumió su "Quantum" de tiempo en CPU o hubo una interrupción de hardware.
- **Contention Ratio:** El porcentaje de de los cambios de contexto totales que fueron forzados (Nonvoluntary / Total). Un ratio >30% suele indicar alta contención de CPU (Thrashing) o que el nivel de concurrencia es demasiado alto para los cores físicos del sistema ("Demasiados cocineros en una cocina muy chica").

### Idle Baseline (Pre-Main RSS)
- **Startup Memory (Pre-Main):** Mide la memoria RSS estrictamente consumida por el programa *después* de que se cargan las bibliotecas en el OS, pero *antes* de que se ejecute la primera línea del `main()`. Esto revela el "Costo Base" u "Overhead Subyacente" puro del Runtime (por ejemplo, el peso de arrancar la Máquina Virtual de Java entera en vacío) independiente de lo que programes.

## ⚠️ Notas y Limitaciones Técnicas (eBPF & Runtimes)

Durante el desarrollo de sucesivas versiones de HeapHop y su testeo cruzado con varios lenguajes, establecimos las siguientes salvedades metodológicas y limitaciones del kernel:

1. **La Discrepancia del Freed Ratio (`mmap` vs `free`)**:
   Las rutinas de asignación de memoria estándar (la capa `libc` con su implementación `ptmalloc` o `jemalloc`) pueden decidir cumplir requerimientos de alojamientos grandes realizando un `mmap` directo al kernel. Cundo la aplicación quiere devolver esa memoria, emite un solo `free()`, el cual la `libc` traduce internamente devuelta a un `munmap`. Anteriormente, HeapHop unificaba estos eventos. La limitación subyacente de eBPF era que nosotros podíamos trazar la ida del `mmap` sin interceptar la capa de usuario, y la vuelta del `free` saltando encima del `munmap`. Al trazar ambas caídas asimétricas, terminaban registrándose más `frees` que `mallocs` (ratio de >100%). Por lo tanto, `mmap` y `munmap` debieron ser aislados del ratio principal para garantizar consistencia topológica.

2. **Go y el Runtime Estático (CGO)**:
   Go posee su propia capa estática para el recolector de basura nativo y asignación de memorias virtuales (no utiliza la biblioteca estándar C visible, ni depende de `malloc` del SO). Así, eBPF no puede enganchar (*hookear*) primitivas de alojamiento convencionales mediante `uprobes` a menos que Go sea compilado explícitamente forzando soporte CGO, ya que de lo contrario, todo es despachado opacamente por las arenas asambladas puramente en el `go-runtime`. HeapHop solo cuenta las métricas de pausas del GC interno y rastrea Syscalls de redimension para perfilar en este lenguaje.

3. **Llamados Asincrónicos y Context Switches Múltiples**:
   En runtimes masivamente concurrentes (Java o Go con Gorutinas), los "Thread Peaks" (Picos de hilos) informados por telemetría del SO no siempre mapean 1:1 con las promesas o abstracciones de usuario (Task/Gorutines) debido a multiplexación tipo M:N implementada bajo cuerda por la VM pertinente. HeapHop informa exclusivamente los hilos **reales del OS (LWP / Kernel threads)**.

🏗️ Arquitectura Técnica

Para garantizar la precisión y la fluidez visual, HeapHop utiliza un stack tecnológico de vanguardia:

    Core: Rust (Backend de alto rendimiento para la intercepción de eventos de memoria).

    Frontend: Tauri + React + TypeScript (Interfaz nativa ligera y segura).

    Modularidad: Estricto cumplimiento del manifiesto de ingeniería: componentes atómicos con un límite de 150 líneas de código por archivo.

✒️ Autoría

Este proyecto es una pieza central de la tesis de grado en Ciencias de la Computación de:

Lautaro Uriel Emalhao Universidad Nacional del Sur (UNS) Bahía Blanca, Argentina - 2026

---

## 🔮 Trabajo Futuro (Evolución de Arquitectura)

Teniendo como base estable el rastreo de eventos de memoria pura (Virtual/RSS) y comportamientos de Scheduling (Context Switches), la expansión natural de la herramienta a futuro se centra en la localidad de los datos y su interacción física térmica a través de contadores de rendimiento de hardware:

- **Integración PMU (Performance Monitoring Unit)**: Escribir rutinas eBPF mediante directivas `bpf_perf_event_read` para la lectura directa de contadores Hardware como *L1/L2/L3 Cache Misses*, e *Instructions Per Cycle (IPC)*. Esto permitirá comparar, desde el mismo dashboard, qué runtimes aplican mejores estrategias de *Data Locality* y por qué el "Object-Oriented Design" tradicional impacta de distinta forma el prefetcher del procesador frente al "Data-Oriented Design", proporcionando evidencia numérica definitiva.
- **Trazado de Contención (Lock Profiling)**: Extensión temporal sobre `futex` y cerrojos nativos de la capa de sistema, para evidenciar cuellos de botella semafóricos en ejecuciones concurrentes extremas.