/*! ya-compass-br.js — ensure South NIC.br registro.br is on the live race
 * Seat after ya-compass-race.js
 */
(function () {
  "use strict";
  var BR = {
    id: "S-BR-registro.br",
    dir: "S",
    url: "https://registro.br/",
    kind: "origin",
    spare: "https://www.camara.leg.br/",
    spareId: "S-BR-camara.leg.br"
  };
  try {
    if (typeof window !== "undefined") {
      window.YA_BR_SOUTH = BR;
      if (typeof window.BOUNCE === "object" && window.BOUNCE) {
        window.BOUNCE.br = BR.id;
        window.BOUNCE.brUrl = BR.url;
      }
      var race = window.YA_COMPASS_RACE;
      if (Array.isArray(race)) {
        var has = race.some(function (e) { return e && e.id === BR.id; });
        if (!has) race.push({ id: BR.id, dir: "S", url: BR.url, kind: "origin" });
      }
    }
  } catch (e) {}
  try {
    if (typeof console !== "undefined") console.log("[ya-compass-br] S-BR-registro.br on live race");
  } catch (e) {}
})();
