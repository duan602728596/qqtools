/**
 * Encryption method on the web side of Xiaohongshu.
 *
 * If you want to get list, use this api:
 * https://edith.xiaohongshu.com/api/sns/web/v1/user_posted?num=30&cursor=&user_id=62331cfb000000001000d273
 *
 * If you want to get time and other details, use this api:
 * https://edith.xiaohongshu.com/api/sns/web/v2/comment/page?note_id=62b56daf000000000e01f82a&cursor=
 *
 * How to use:
 * sign('/api/sns/web/v1/user_posted?num=30&cursor=&user_id=62331cfb000000001000d273', undefined)
 *
 * Need headers:
 * {
 *   "Cookie": "web_session=xxx",
 *   "x-s": "",
 *   "x-t": "",
 *   "x-s-common": "",
 *   "x-b3-traceid", ""
 * }
 *
 */
const crypto = require('node:crypto');

function MD5(a) {
  const hash = crypto.createHash('md5');

  hash.update(a)

  return hash.digest('hex');
}

/**
 * If you are not calling in the browser, you need to simulate window.
 */
var windowMock = {
  navigator: {
    userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36'
  },
  alert() {}
};

var esm_typeof = {
  Z(a) {
    return typeof a;
  }
}

function parse_int_default() {
  return parseInt;
}

function a0_0x5a79() {
  var e = ["tvGNf", "LOOrP", "isArray", "substr", "uKUZY", "4452525SuVciK", "fromCha", "jaAJX", " Object", "eYVTC", "VPDbw", "LQJIN", "bIoIt", "RAazS", "vFurd", "398524qLrYmx", "Hex", "AhrYY", "rSULQ", "eAt", "push", "Words", "qxeiA", "[object", "bOfQU", "|3|1|6|", "undefin", "lcJDM", "OjNlB", "npUku", "shFgg", "Bytes", "cIYCO", "jYnBe", "AACPJ", "String", "BVZwy", "XoHZf", "pow", "yWLHx", "XijJW", "fccHo", "GagEE", "kFiJR", "kPxHT", "uqZoP", "JAxlG", "crMna", "ffHAy", "YbZgt", "cVte9UJ", "HIJKLMN", "roperty", "test", "iCuMI", "slice", "binary", "ZaUsL", "EezaX", "aqege", "456789+", "smllo", "kvquB", "ZgYto", "sWFru", "VWXYZab", "MbLkN", "encodin", "wordsTo", "kQHog", "IDkdx", "YfGHk", "get", "_blocks", "BvKNX", "WslPu", "iamspam", "nVtFt", "OAolL", "0XTdDgM", "TvJZj", "stringT", "RBFhs", "TXhTR", "nQukf", "GwUUs", "GDsxQ", "AXBCq", "oWyVU", "anyTY", "GoEZk", "tecAP", "MuyRv", "LvgEs", "ule", "oBytes", "ble", "default", "YduTO", "jiTIp", "grKok", "dcPaY", "bin", "random", "bytesTo", "HDmmx", "fQIQU", "CRbaw", "HdSQB", "OVGOU", "LpfE8xz", "stringi", "oHQtNP+", "SLIdu", "DpSoo", "ATWtM", "bqDaf", "toStrin", "ymqYH", "IJEoj", "enumera", "jklmnop", "charAt", "zqyyp", "GLqBv", "_hh", "0|4|1|3", "1|2|6|7", "PPKAa", "Illegal", "oweMY", "MEatr", "qgAvo", "dSyum", "EGOqf", "Ckzfe", "bhAHQ", "ZOMOA", "pDHep", "charCod", "LgHoh", "STybd", "bVZzs", "CoGXE", "BMFSu", "GirPm", "nt ", "LaKYI", "ncvGi", "SQQAv", "iwltS", "MruYQ", "bBEav", "length", "hWCxo", "gkwjp", "KVPay", "raSoA", "EMLRo", "zPLJb", "tmXUb", "TTYXx", "CcyBF", "_isBuff", "YDcjt", "Adtfa", "szTdE", "gwbID", "szaMQ", "qEftJ", "rable", "jGECV", "khBjN", "PgptU", "|3|0|5|", "TQBrM", "NbLaf", "NOiuy", "FPaUz", "CpAiz", "fsgzU", "hPSmI", "xyz0123", "KbqST", "wcDTG", "atLE", "kcudt", "BhPEm", "hasOwnP", "wsMnf", "mZwVe", "pngG8yJ", "sHTSy", "NwSjN", "QNpig", "ifeoJ", "FElCj", "sVYgG", "TapNb", "ykHMn", "wsZMG", "IIHVQ", "hWEFA", "cXqsA", "fciFe", "TiLMD", "size", "zpOyv", "UNDTo", "readFlo", "CkfrK", "DktqT", "iNznS", "OqNfZ", "kvsCX", "ldFAh", "a2r1ZQo", "2445590StPRLD", "GkrDW", "LjFjr", "GPOtx", "string", "mOSaR", "Bvk6/7=", "TjoHT", "utf8", "gDrEw", "__esMod", "kCaHy", "split", "MlJAR", "XpJuc", "qAwzL", "Vapyb", "NriOb", "oqmgK", "fRUES", "alert", "UcRES", "OPQRSTU", "navigat", "wOcza/L", "ABCDEFG", "BoDQu", "ncdJa", "QRwZy", "ReDEz", "6183336CivpSL", "WJyBZ", "zLCWW", "JlsLP", "fClwM", "asStrin", "lzJZP", "floor", "TgDbm", "isBuffe", "jvJiF", "SABMP", "hdQcO", "YmZhP", "iUPsm", "x3VT16I", "rotl", "sajna", "_ii", "bSOEY", "YNSey", "constru", "aEcrL", "KQHVv", "12uchxSR", "userAge", "getTime", "defineP", "ize", "MHzGn", "eWlBu", "GGhMh", "call", "957903QEGqtm", "LRnFa", "DWesa", "HxsYR", "Vgfdz", "kAfZg", "indexOf", "gtDTX", "ZSeJg", "fkHAJ", "VRTFJ", "cdefghi", "feTDL", "xkLjY", "QgZSI", "SUszo", " Array]", "gNCqr", "WyWOq", "YPzQp", "OiiKE", "64DfFvHL", "aPxIV", "AzYyd", "dgPGf", "GbwzQ", "BObjy", "9472617KbSUjn", "684891qDcRYp", "HVRHK", "tUwZw", "HQOfg", "hECvuRX", "IxuxO", "rCode", "eYpfs", "0DSfdik", "_gg", "xTqVA", "lUAFM97", "q42KWYj", "replace", "Fcvbd", "tSuKA", "2ronXdL", "5|2|7|8", "prototy", "SrrvE", "WCJsY", "TgLDB", "pIfJW", "FlTfW", "configu", "4|0", "ugsUl", "qrstuvw", "endian", "ksCzn", "ctor", "_ff", "asBytes", "iXmJy", "mmRiP", "KUobN", " argume", "LpkCF", "yRnhISG", "mjclG", "kyTxR", "join", "exports", "uUXon", "AFluW", "IYTJG", "RjzRb", "A4NjFqY", "xXGXd", "IWEHf", "u5wPHsO", "pnICQ", "cEfeo", "KxVcl", "bBcCf", "sntZV", "ZmserbB", "functio", "_digest", "WiGun", "KblCWi+", "gReZW", "KSyOR", "AzOlH", "oHpmG", "CAVFI"];
  return (a0_0x5a79 = function() {
      return e
    }
  )()
}

!function(e, t) {
  var r = 15
    , n = 154
    , o = 10
    , i = 24
    , a = 16
    , s = 94
    , u = 275
    , l = 84
    , c = 34
    , p = 12
    , d = 68
    , f = 6
    , g = 106
    , _ = 163
    , h = 78
    , m = 69
    , v = {
    _0x44310d: 322
  }
    , y = e();
  function b(e, t) {
    return a0_0x5b83(e - -v._0x44310d, t)
  }
  for (; ; )
    try {
      if (844900 === parse_int_default()(b(-r, -n)) / 1 * (parse_int_default()(b(29, o)) / 2) + -parse_int_default()(b(-i, -a)) / 3 * (parse_int_default()(b(s, u)) / 4) + -parse_int_default()(b(l, 60)) / 5 + -parse_int_default()(b(-48, c)) / 6 + parse_int_default()(b(p, -d)) / 7 + -parse_int_default()(b(f, -g)) / 8 * (-parse_int_default()(b(13, _)) / 9) + parse_int_default()(b(-h, -m)) / 10)
        break;
      y.push(y.shift())
    } catch (w) {
      y.push(y.shift())
    }
}(a0_0x5a79);

function a0_0x5b83(e, t) {
  var r = a0_0x5a79();
  return (a0_0x5b83 = function(e, t) {
      return r[e -= 142]
    }
  )(e, t)
}

function a0_0x34ec01(e, t) {
  return a0_0x5b83(e - 588, t)
}

/**
 * Encryption algorithm of Xiaohongshu request header. It returns x-s and x-t.
 * x-b3-traceid and x-s-common are also required in the header, but do not need to be calculated.
 * @param { string } e
 * @param { object | undefined } t
 */
function sign(e, t) {
  var r = 1487
    , n = 1383
    , o = 1199
    , i = 1333
    , a = 1173
    , s = 1330
    , u = 1315
    , l = 1288
    , c = 1272
    , p = 1386
    , d = 1512
    , f = 1149
    , g = 1014
    , _ = 1357
    , h = 1284
    , m = 1140
    , v = 1279
    , y = 1457
    , b = 1301
    , w = 1440
    , x = 1400
    , S = 1356
    , T = 1206
    , E = 1294
    , k = 1377
    , I = 1127
    , A = 1044
    , L = 1159
    , C = 1067
    , O = 1032
    , M = 1173
    , N = 1031
    , R = 1205
    , j = 1170
    , F = 1101
    , P = 1360
    , D = 1536
    , B = 1262
    , U = 1259
    , W = 1262
    , H = 1050
    , G = 932
    , z = 1212
    , V = 1247
    , q = 1250
    , $ = 1262
    , Z = 1050
    , Y = 1330
    , X = 1234
    , K = 1364
    , J = 1213
    , Q = 1418
    , ee = 1282
    , te = 785
    , re = 780
    , ne = 819
    , oe = 535
    , ie = 519
    , ae = 773
    , se = 764
    , ue = 588
    , le = 766
    , ce = 500
    , pe = 451
    , de = 572
    , fe = 504
    , ge = 367
    , _e = 380
    , he = 395
    , me = 504
    , ve = 582
    , ye = 654
    , be = 734
    , we = 767
    , xe = 521
    , Se = 775
    , Te = 799
    , Ee = 971
    , ke = 629
    , Ie = 813
    , Ae = 773
    , Le = 639
    , Ce = 810
    , Oe = 521
    , Me = 531
    , Ne = 860
    , Re = {
      _0x3d6786: 318
    }
    , je = 177
    , Fe = 229
    , Pe = 190
    , De = 212
    , Be = 30
    , Ue = 105
    , We = 213
    , He = 107
    , Ge = 352
    , ze = 184
    , Ve = 203
    , qe = 240
    , $e = 100
    , Ze = 141
    , Ye = 118
    , Xe = 270
    , Ke = 184
    , Je = 147
    , Qe = 484
    , et = 353
    , tt = 185
    , rt = 355
    , nt = 184
    , ot = 151
    , it = 298
    , at = 125
    , st = 118
    , ut = 243
    , lt = 199
    , ct = 353
    , pt = 80
    , dt = 118
    , ft = 279
    , gt = 298
    , _t = 36
    , ht = 252
    , mt = 87
    , vt = 250
    , yt = 118
    , bt = 184
    , wt = 224
    , xt = 146
    , St = {
      _0x263e85: 1431
    },
    /**
     * @type { object } Tt
     */
    Tt = {
      aEcrL: function(e, t) {
        return e < t
      },
      SABMP: function(e, t) {
        return e > t
      },
      bOfQU: function(e, t) {
        return e < t
      },
      uUXon: function(e, t) {
        return e | t
      },
      GirPm: function(e, t) {
        return e >> t
      },
      wsZMG: function(e, t) {
        return e | t
      },
      uKUZY: function(e, t) {
        return e & t
      },
      AFluW: function(e, t) {
        return e & t
      },
      XoHZf: function(e, t) {
        return e >> t
      },
      npUku: function(e, t) {
        return e(t)
      },
      AhrYY: It(1258, 1311) + It(1332, r) + It(1266, 1138),
      VPDbw: function(e, t) {
        return e + t
      },
      ymqYH: function(e, t) {
        return e + t
      },
      mZwVe: function(e, t) {
        return e + t
      },
      HdSQB: function(e, t) {
        return e << t
      },
      TgDbm: function(e, t) {
        return e | t
      },
      kFiJR: function(e, t) {
        return e << t
      },
      ZaUsL: function(e, t) {
        return e(t)
      },
      iCuMI: function(e, t) {
        return e & t
      },
      LvgEs: It(n, o),
      IDkdx: function(e, t) {
        return e === t
      },
      QNpig: function(e, t) {
        return e !== t
      },
      gDrEw: It(i, a) + "ed",
      TgLDB: function(e, t) {
        return e === t
      },
      kAfZg: It(s, 1511) + It(u, 1451) + "]"
    }
    , Et = function(e) {
      e = e[o(-227, -je)](/\r\n/g, "\n");
      for (var t = "", r = 0; Tt[o(-100, -Fe)](r, e[o(-Pe, -345)]); r++) {
        var n = e[o(-De, -359) + o(Be, -Ue)](r);
        Tt[o(-We, -Fe)](n, 128) ? t += String[o(-He, -118) + o(-Ge, -ze)](n) : Tt[o(-Ve, -qe)](n, 127) && Tt[o(-157, -$e)](n, 2048) ? (t += String[o(-Ze, -Ye) + o(-Xe, -Ke)](Tt[o(-180, -Je)](Tt[o(-Qe, -et)](n, 6), 192)),
          t += String[o(-tt, -Ye) + o(-rt, -nt)](Tt[o(-ot, -it)](Tt[o(36, -120)](n, 63), 128))) : (t += String[o(-at, -st) + o(-ut, -nt)](Tt[o(-482, -it)](Tt[o(-lt, -ct)](n, 12), 224)),
          t += String[o(-pt, -dt) + o(-ft, -nt)](Tt[o(-309, -gt)](Tt[o(_t, -146)](Tt[o(-ht, -mt)](n, 6), 63), 128)),
          t += String[o(-vt, -yt) + o(-290, -bt)](Tt[o(-wt, -298)](Tt[o(-37, -xt)](n, 63), 128)))
      }
      function o(e, t) {
        return It(t - -St._0x263e85, e)
      }
      return t
    }
    , kt = It(l, c) + It(1291, 1397) + It(p, d) + It(f, g) + It(_, h) + It(1156, m) + It(v, y) + It(b, w) + It(1417, 1230) + "m3";
  function It(e, t) {
    return a0_0x34ec01(e - Re._0x3d6786, t)
  }
  var At = Tt[It(x, S)]
    , Lt = (new Date)[It(T, E)]()
    , Ct = typeof window === "object" ? window : windowMock;

  Tt[It(I, A)]((0,
    esm_typeof.Z)(Ct), Tt[It(L, C)]) && Ct && Ct[It(1173, O) + "or"] && Ct[It(M, N) + "or"][It(R, L) + "nt"] && Ct[It(j, F)] && (At = It(P, D));

  var Ot = Tt[It(B, 1248)](Object[It(U, W) + "pe"][It(H, G) + "g"][It(z, V)](t), Tt[It(1218, q)]) || Tt[It($, 1147)](Object[It(1259, 1260) + "pe"][It(Z, 941) + "g"][It(z, 1138)](t), It(Y, 1335) + It(1229, X));
  return {
    "X-s": Tt[It(K, J)]((function(e) {
        var t, r, n, o, i, a, s, u = "", l = 0;
        for (e = Tt[d(te, 784)](Et, e); Tt[d(re, ne)](l, e[d(oe, ie)]); )
          for (var c = Tt[d(ae, se)][d(611, ue)]("|"), p = 0; ; ) {
            switch (c[p++]) {
              case "0":
                u = Tt[d(le, 876)](Tt[d(ce, pe)](Tt[d(de, 654)](u, kt[d(fe, ge)](o)), kt[d(fe, _e)](i)), kt[d(504, he)](a)) + kt[d(me, 605)](s);
                continue;
              case "1":
                a = Tt[d(ve, ye)](Tt[d(864, ae)](Tt[d(be, we)](r, 15), 2), n >> 6);
                continue;
              case "2":
                r = e[d(xe, 609) + d(Se, 648)](l++);
                continue;
              case "3":
                i = Tt[d(637, 692)](Tt[d(Te, Ee)](3 & t, 4), r >> 4);
                continue;
              case "4":
                Tt[d(te, ke)](isNaN, r) ? a = s = 64 : Tt[d(Ie, Ae)](isNaN, n) && (s = 64);
                continue;
              case "5":
                t = e[d(xe, 361) + d(775, Le)](l++);
                continue;
              case "6":
                s = Tt[d(Ce, 689)](n, 63);
                continue;
              case "7":
                n = e[d(Oe, Me) + d(775, Ne)](l++);
                continue;
              case "8":
                o = t >> 2;
                continue
            }
            break
          }
        function d(e, t) {
          return It(e - -551, t)
        }
        return u
      }
    ), MD5([Lt, At, e, Ot ? JSON[It(Q, 1361) + "fy"](t) : ""][It(ee, 1192)](""))),
    "X-t": Lt
  }
}

module.exports = {
  sign
};