use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Language {
    C,
    Cpp,
    Rust,
    Java,
    Python,
    Go,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProfileType {
    Manual,
    Gc,
    Interpreter,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetricCapabilities {
    pub profile: ProfileType,
    pub ebpf_malloc: bool,
    pub ebpf_mmap: bool,
    pub proc_telemetry: bool,
    pub gc_metrics: bool,
    pub artifact_footprint: bool,
    pub concurrency: bool,
}

pub struct LanguageVariant {
    pub id: &'static str,
    pub language: Language,
    pub compiler: &'static str,
    pub label: &'static str,
    pub build_cmd: &'static str,
    pub run_cmd: &'static str,
}

// ─── C (gcc) ────────────────────────────────────────────────────

pub const C_GCC_O0: LanguageVariant = LanguageVariant {
    id: "c_gcc_o0",
    language: Language::C,
    compiler: "gcc",
    label: "C — gcc -O0",
    build_cmd: "gcc -O0 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_GCC_O2: LanguageVariant = LanguageVariant {
    id: "c_gcc_o2",
    language: Language::C,
    compiler: "gcc",
    label: "C — gcc -O2",
    build_cmd: "gcc -O2 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_GCC_O3: LanguageVariant = LanguageVariant {
    id: "c_gcc_o3",
    language: Language::C,
    compiler: "gcc",
    label: "C — gcc -O3",
    build_cmd: "gcc -O3 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_GCC_OS: LanguageVariant = LanguageVariant {
    id: "c_gcc_os",
    language: Language::C,
    compiler: "gcc",
    label: "C — gcc -Os",
    build_cmd: "gcc -Os -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_GCC_OFAST: LanguageVariant = LanguageVariant {
    id: "c_gcc_ofast",
    language: Language::C,
    compiler: "gcc",
    label: "C — gcc -Ofast",
    build_cmd: "gcc -Ofast -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_GCC_LTO: LanguageVariant = LanguageVariant {
    id: "c_gcc_lto",
    language: Language::C,
    compiler: "gcc",
    label: "C — gcc LTO+Native",
    build_cmd: "gcc -O3 -flto -march=native -lpthread {file} -o {out}",
    run_cmd: "{out}",
};

// ─── C (clang) ──────────────────────────────────────────────────

pub const C_CLANG_O0: LanguageVariant = LanguageVariant {
    id: "c_clang_o0",
    language: Language::C,
    compiler: "clang",
    label: "C — clang -O0",
    build_cmd: "clang -O0 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_CLANG_O2: LanguageVariant = LanguageVariant {
    id: "c_clang_o2",
    language: Language::C,
    compiler: "clang",
    label: "C — clang -O2",
    build_cmd: "clang -O2 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_CLANG_O3: LanguageVariant = LanguageVariant {
    id: "c_clang_o3",
    language: Language::C,
    compiler: "clang",
    label: "C — clang -O3",
    build_cmd: "clang -O3 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_CLANG_OS: LanguageVariant = LanguageVariant {
    id: "c_clang_os",
    language: Language::C,
    compiler: "clang",
    label: "C — clang -Os",
    build_cmd: "clang -Os -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_CLANG_OFAST: LanguageVariant = LanguageVariant {
    id: "c_clang_ofast",
    language: Language::C,
    compiler: "clang",
    label: "C — clang -Ofast",
    build_cmd: "clang -Ofast -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const C_CLANG_LTO: LanguageVariant = LanguageVariant {
    id: "c_clang_lto",
    language: Language::C,
    compiler: "clang",
    label: "C — clang LTO+Native",
    build_cmd: "clang -O3 -flto -march=native -lpthread {file} -o {out}",
    run_cmd: "{out}",
};

// ─── C++ (g++) ──────────────────────────────────────────────────

pub const CPP_GPP_O0: LanguageVariant = LanguageVariant {
    id: "cpp_gpp_o0",
    language: Language::Cpp,
    compiler: "g++",
    label: "C++ — g++ -O0",
    build_cmd: "g++ -O0 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_GPP_O2: LanguageVariant = LanguageVariant {
    id: "cpp_gpp_o2",
    language: Language::Cpp,
    compiler: "g++",
    label: "C++ — g++ -O2",
    build_cmd: "g++ -O2 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_GPP_O3: LanguageVariant = LanguageVariant {
    id: "cpp_gpp_o3",
    language: Language::Cpp,
    compiler: "g++",
    label: "C++ — g++ -O3",
    build_cmd: "g++ -O3 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_GPP_OS: LanguageVariant = LanguageVariant {
    id: "cpp_gpp_os",
    language: Language::Cpp,
    compiler: "g++",
    label: "C++ — g++ -Os",
    build_cmd: "g++ -Os -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_GPP_OFAST: LanguageVariant = LanguageVariant {
    id: "cpp_gpp_ofast",
    language: Language::Cpp,
    compiler: "g++",
    label: "C++ — g++ -Ofast",
    build_cmd: "g++ -Ofast -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_GPP_LTO: LanguageVariant = LanguageVariant {
    id: "cpp_gpp_lto",
    language: Language::Cpp,
    compiler: "g++",
    label: "C++ — g++ LTO+Native",
    build_cmd: "g++ -O3 -flto -march=native -lpthread {file} -o {out}",
    run_cmd: "{out}",
};

pub const CPP_CLANGPP_O0: LanguageVariant = LanguageVariant {
    id: "cpp_clangpp_o0",
    language: Language::Cpp,
    compiler: "clang++",
    label: "C++ — clang++ -O0",
    build_cmd: "clang++ -O0 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_CLANGPP_O2: LanguageVariant = LanguageVariant {
    id: "cpp_clangpp_o2",
    language: Language::Cpp,
    compiler: "clang++",
    label: "C++ — clang++ -O2",
    build_cmd: "clang++ -O2 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_CLANGPP_O3: LanguageVariant = LanguageVariant {
    id: "cpp_clangpp_o3",
    language: Language::Cpp,
    compiler: "clang++",
    label: "C++ — clang++ -O3",
    build_cmd: "clang++ -O3 -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_CLANGPP_OS: LanguageVariant = LanguageVariant {
    id: "cpp_clangpp_os",
    language: Language::Cpp,
    compiler: "clang++",
    label: "C++ — clang++ -Os",
    build_cmd: "clang++ -Os -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_CLANGPP_OFAST: LanguageVariant = LanguageVariant {
    id: "cpp_clangpp_ofast",
    language: Language::Cpp,
    compiler: "clang++",
    label: "C++ — clang++ -Ofast",
    build_cmd: "clang++ -Ofast -lpthread {file} -o {out}",
    run_cmd: "{out}",
};
pub const CPP_CLANGPP_LTO: LanguageVariant = LanguageVariant {
    id: "cpp_clangpp_lto",
    language: Language::Cpp,
    compiler: "clang++",
    label: "C++ — clang++ LTO+Native",
    build_cmd: "clang++ -O3 -flto -march=native -lpthread {file} -o {out}",
    run_cmd: "{out}",
};

// ─── Rust ───────────────────────────────────────────────────────

pub const RUST_DEBUG: LanguageVariant = LanguageVariant {
    id: "rust_debug",
    language: Language::Rust,
    compiler: "rustc",
    label: "Rust — Debug",
    build_cmd: "rustc {file} -o {out}",
    run_cmd: "{out}",
};
pub const RUST_RELEASE: LanguageVariant = LanguageVariant {
    id: "rust_release",
    language: Language::Rust,
    compiler: "rustc",
    label: "Rust — Release (O2)",
    build_cmd: "rustc -C opt-level=2 {file} -o {out}",
    run_cmd: "{out}",
};
pub const RUST_O3: LanguageVariant = LanguageVariant {
    id: "rust_o3",
    language: Language::Rust,
    compiler: "rustc",
    label: "Rust — rustc -O3",
    build_cmd: "rustc -C opt-level=3 {file} -o {out}",
    run_cmd: "{out}",
};
pub const RUST_OS: LanguageVariant = LanguageVariant {
    id: "rust_os",
    language: Language::Rust,
    compiler: "rustc",
    label: "Rust — rustc -Os",
    build_cmd: "rustc -C opt-level=s {file} -o {out}",
    run_cmd: "{out}",
};
pub const RUST_OFAST: LanguageVariant = LanguageVariant {
    id: "rust_ofast",
    language: Language::Rust,
    compiler: "rustc",
    label: "Rust — rustc -Ofast",
    build_cmd: "rustc -C opt-level=3 -C fast-math {file} -o {out}",
    run_cmd: "{out}",
};
pub const RUST_MAX: LanguageVariant = LanguageVariant {
    id: "rust_max",
    language: Language::Rust,
    compiler: "rustc",
    label: "Rust — Max (LTO+Native)",
    build_cmd:
        "rustc -C opt-level=3 -C lto=fat -C codegen-units=1 -C target-cpu=native {file} -o {out}",
    run_cmd: "{out}",
};

// ─── Java ───────────────────────────────────────────────────────

pub const JAVA_DEFAULT: LanguageVariant = LanguageVariant {
    id: "java_default",
    language: Language::Java,
    compiler: "javac",
    label: "Java — JIT (default)",
    build_cmd: "javac -d {outDir} {file}",
    run_cmd: "java -cp {outDir} {fileNameWithoutExt}",
};

// ─── Python ─────────────────────────────────────────────────────

pub const PYTHON_DEFAULT: LanguageVariant = LanguageVariant {
    id: "python_default",
    language: Language::Python,
    compiler: "python3",
    label: "Python — CPython",
    build_cmd: "",
    run_cmd: "python3 -u {file}",
};

// ─── Go ─────────────────────────────────────────────────────────

pub const GO_DEFAULT: LanguageVariant = LanguageVariant {
    id: "go_default",
    language: Language::Go,
    compiler: "go",
    label: "Go — Default",
    build_cmd: "go build -o {out} {file}",
    run_cmd: "{out}",
};
pub const GO_CGO: LanguageVariant = LanguageVariant {
    id: "go_cgo",
    language: Language::Go,
    compiler: "go",
    label: "Go — CGO (libc visible)",
    build_cmd: "go build -o {out} {file}",
    run_cmd: "{out}",
};

// ─── Registry ───────────────────────────────────────────────────

pub const ALL_VARIANTS: &[&LanguageVariant] = &[
    // C
    &C_GCC_O0,
    &C_GCC_O2,
    &C_GCC_O3,
    &C_GCC_OS,
    &C_GCC_OFAST,
    &C_GCC_LTO,
    &C_CLANG_O0,
    &C_CLANG_O2,
    &C_CLANG_O3,
    &C_CLANG_OS,
    &C_CLANG_OFAST,
    &C_CLANG_LTO,
    // C++
    &CPP_GPP_O0,
    &CPP_GPP_O2,
    &CPP_GPP_O3,
    &CPP_GPP_OS,
    &CPP_GPP_OFAST,
    &CPP_GPP_LTO,
    &CPP_CLANGPP_O0,
    &CPP_CLANGPP_O2,
    &CPP_CLANGPP_O3,
    &CPP_CLANGPP_OS,
    &CPP_CLANGPP_OFAST,
    &CPP_CLANGPP_LTO,
    // Rust
    &RUST_DEBUG,
    &RUST_RELEASE,
    &RUST_O3,
    &RUST_OS,
    &RUST_OFAST,
    &RUST_MAX,
    // Java
    &JAVA_DEFAULT,
    // Python
    &PYTHON_DEFAULT,
    // Go
    &GO_DEFAULT,
    &GO_CGO,
];

/// Find a variant by its ID.
pub fn find_variant(id: &str) -> Option<&'static LanguageVariant> {
    ALL_VARIANTS.iter().find(|v| v.id == id).copied()
}

/// Get metric capabilities for a language.
pub fn capabilities(lang: Language) -> MetricCapabilities {
    match lang {
        Language::C | Language::Cpp | Language::Rust => MetricCapabilities {
            profile: ProfileType::Manual,
            ebpf_malloc: true,
            ebpf_mmap: true,
            proc_telemetry: true,
            gc_metrics: false,
            artifact_footprint: true,
            concurrency: true,
        },
        Language::Java => MetricCapabilities {
            profile: ProfileType::Gc,
            ebpf_malloc: false,
            ebpf_mmap: true,
            proc_telemetry: true,
            gc_metrics: true,
            artifact_footprint: false,
            concurrency: true,
        },
        Language::Python => MetricCapabilities {
            profile: ProfileType::Interpreter,
            ebpf_malloc: false,
            ebpf_mmap: true,
            proc_telemetry: true,
            gc_metrics: true,
            artifact_footprint: false,
            concurrency: true,
        },
        Language::Go => MetricCapabilities {
            profile: ProfileType::Gc,
            ebpf_malloc: false,
            ebpf_mmap: true,
            proc_telemetry: true,
            gc_metrics: true,
            artifact_footprint: false,
            concurrency: true,
        },
    }
}

/// Check if a Go variant should use CGO (and thus enable malloc uprobes too).
pub fn is_cgo_variant(variant: &LanguageVariant) -> bool {
    variant.id == "go_cgo"
}

/// Serializable variant info for the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VariantInfo {
    pub id: String,
    pub language: Language,
    pub compiler: String,
    pub label: String,
    pub capabilities: MetricCapabilities,
}

/// List all variants with capabilities, for the frontend.
pub fn list_all_variants() -> Vec<VariantInfo> {
    ALL_VARIANTS
        .iter()
        .map(|v| {
            let mut caps = capabilities(v.language);
            // CGO variant gets malloc probes too
            if is_cgo_variant(v) {
                caps.ebpf_malloc = true;
            }
            VariantInfo {
                id: v.id.to_string(),
                language: v.language,
                compiler: v.compiler.to_string(),
                label: v.label.to_string(),
                capabilities: caps,
            }
        })
        .collect()
}
