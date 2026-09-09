/*! ya-compass-br.js — South slot: NIC.br registro.br (200.160.2.3)
 * Seat after ya-compass-race.js / ya-ping-bounce.js
 */
(function () {
  "use strict";
  var BR = {
    id: "S-BR-registro.br",
    url: "https://registro.br",
    spare: "https://www.camara.leg.br",
    spareId: "S-BR-camara.leg.br"
  };
  try {
    if (typeof window !== "undefined") {
      window.YA_BR_SOUTH = BR;
      if (typeof window.BOUNCE === "object" && window.BOUNCE) {
        window.BOUNCE.br = BR.id;
        window.BOUNCE.brUrl = BR.url;
      }
    }
  } catch (e) {}
  try {
    if (typeof console !== "undefined") console.log("[ya-compass-br] S-BR-registro.br seated");
  } catch (e) {}
})();
