(function() {
    if (!window.EJS_pathtodata) {
        console.error("EJS ERROR: EJS_pathtodata não definido");
        return;
    }

    function loadScript(src, cb) {
        const s = document.createElement("script");
        s.src = src;
        s.onload = cb;
        document.head.appendChild(s);
    }

    loadScript(EJS_pathtodata + "emulator.min.js", function () {
        const container = document.querySelector(EJS_player);
        container.innerHTML = "";

        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.background = "#000";
        canvas.style.display = "block";
        container.appendChild(canvas);

        const Module = {
            canvas: canvas,
            locateFile: (p) => EJS_pathtodata + p,
            noInitialRun: true,
            preRun: [],
            postRun: []
        };

        function createIOSStartButton() {
            return new Promise(resolve => {
                const btn = document.createElement("button");
                btn.innerText = "Iniciar Jogo";
                btn.style.position = "absolute";
                btn.style.top = "50%";
                btn.style.left = "50%";
                btn.style.transform = "translate(-50%, -50%)";
                btn.style.padding = "18px 28px";
                btn.style.fontSize = "20px";
                btn.style.zIndex = "9999";

                document.body.appendChild(btn);

                btn.addEventListener("click", () => {
                    btn.remove();
                    resolve();
                }, { once: true });
            });
        }

        async function start() {
            await createIOSStartButton();

            fetch(EJS_gameUrl)
                .then(r => r.arrayBuffer())
                .then(buf => {
                    Module.gameData = new Uint8Array(buf);

                    Module.arguments = [
                        "--core=" + EJS_core,
                        "--game"
                    ];

                    if (window.EJS_dontExtractRom)
                        Module.arguments.push("--raw");

                    window.EJS_emulator = new Emulator(Module);
                    window.EJS_emulator.start();
                })
                .catch(err => console.error("EJS ROM ERROR:", err));
        }

        start();
    });
})();
