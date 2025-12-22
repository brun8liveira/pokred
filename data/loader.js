(function() {

    if (typeof window.EJS_pathtodata === "undefined") {
        console.error("EJS ERROR: EJS_pathtodata não definido.");
        return;
    }

    const script = document.createElement("script");
    script.src = EJS_pathtodata + "emulator.js";
    script.async = true;

    script.onload = function() {
        if (typeof EJS_ready === "function") {
            EJS_ready();
        }
    };

    document.head.appendChild(script);

    window.EJS_ready = function() {

        if (!window.EJS_player) {
            console.error("EJS ERROR: EJS_player não definido");
            return;
        }

        let container = document.querySelector(EJS_player);
        if (!container) {
            console.error("EJS ERROR: Não foi possível encontrar container:", EJS_player);
            return;
        }

        container.innerHTML = "";

        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#000";
        container.appendChild(canvas);

        const Module = {
            canvas: canvas,
            arguments: [],
            preRun: [],
            postRun: [],
            noInitialRun: true,
            locateFile: function(path) {
                return EJS_pathtodata + path;
            }
        };

        const script2 = document.createElement("script");
        script2.src = EJS_pathtodata + "gba.js";
        script2.async = true;

        script2.onload = function() {
            if (!window.EJS_startOnLoaded) {
                createStartButton();
            } else {
                startEmulator();
            }
        };

        document.head.appendChild(script2);

        function createStartButton() {
            const btn = document.createElement("button");
            btn.innerText = window.EJS_startButtonName || "Clique para iniciar";
            btn.style.position = "absolute";
            btn.style.top = "50%";
            btn.style.left = "50%";
            btn.style.transform = "translate(-50%, -50%)";
            btn.style.padding = "16px 28px";
            btn.style.fontSize = "18px";
            btn.style.borderRadius = "10px";
            btn.style.cursor = "pointer";
            btn.style.zIndex = "999";

            document.body.appendChild(btn);

            btn.addEventListener("click", function() {
                btn.remove();
                startEmulator();
            });
        }

        function startEmulator() {

            if (typeof window.EJS_emulator !== "undefined") {
                try {
                    EJS_emulator.stop();
                } catch(e){}
            }

            if (!window.EJS_gameUrl) {
                console.error("EJS ERROR: EJS_gameUrl não definido.");
                return;
            }

            fetch(EJS_gameUrl)
                .then(r => r.arrayBuffer())
                .then(buffer => {
                    Module.arguments = [
                        "--core=" + (window.EJS_core || "gba"),
                        "--game",
                    ];

                    if (window.EJS_dontExtractRom) {
                        Module.arguments.push("--raw");
                    }

                    Module["gameData"] = new Uint8Array(buffer);
                    window.EJS_emulator = new Emulator(Module);
                    window.EJS_emulator.start();
                })
                .catch(err => {
                    console.error("EJS ERROR: Falha ao carregar ROM:", err);
                });
        }
    };
})();
