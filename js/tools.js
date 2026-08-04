/* ============================================================
   ARGROW — Standalone tool apps (QR generator, Kâr/Zarar app)
   Loaded only on qr-menu.html and kar-zarar.html.
   ============================================================ */
(function(){
  "use strict";

  document.addEventListener('DOMContentLoaded', function(){

    /* ================================================================
       QR CODE GENERATOR (with logo + custom color)
       ================================================================ */
    var qrInput = document.getElementById('qrInput');
    var qrBtn = document.getElementById('qrGenerateBtn');
    var qrOutput = document.getElementById('qrOutput');
    var qrDownloadBtn = document.getElementById('qrDownloadBtn');
    var qrColorInput = document.getElementById('qrColorInput');
    var qrLogoInput = document.getElementById('qrLogoInput');
    var qrLogoPreview = document.getElementById('qrLogoPreview');
    var qrLogoClear = document.getElementById('qrLogoClear');

    if(qrBtn && qrInput && qrOutput && typeof qrcode !== 'undefined'){
      var logoDataUrl = null;

      if(qrLogoInput){
        qrLogoInput.addEventListener('change', function(){
          var file = qrLogoInput.files && qrLogoInput.files[0];
          if(!file){ return; }
          var reader = new FileReader();
          reader.onload = function(e){
            logoDataUrl = e.target.result;
            if(qrLogoPreview){
              qrLogoPreview.src = logoDataUrl;
              qrLogoPreview.classList.remove('is-hidden');
            }
            if(qrLogoClear) qrLogoClear.classList.remove('is-hidden');
          };
          reader.readAsDataURL(file);
        });
      }
      if(qrLogoClear){
        qrLogoClear.addEventListener('click', function(){
          logoDataUrl = null;
          if(qrLogoInput) qrLogoInput.value = '';
          if(qrLogoPreview) qrLogoPreview.classList.add('is-hidden');
          qrLogoClear.classList.add('is-hidden');
        });
      }

      function renderQR(){
        var text = qrInput.value.trim();
        if(!text){ qrInput.focus(); return; }

        var color = (qrColorInput && qrColorInput.value) || '#10141a';
        var ec = logoDataUrl ? 'H' : 'M';

        var qr = qrcode(0, ec);
        qr.addData(text);
        qr.make();

        var count = qr.getModuleCount();
        var cell = 8;
        var margin = cell * 4;
        var size = count * cell + margin * 2;

        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = color;
        for(var r = 0; r < count; r++){
          for(var c = 0; c < count; c++){
            if(qr.isDark(r, c)){
              ctx.fillRect(margin + c * cell, margin + r * cell, cell, cell);
            }
          }
        }

        function finish(){
          qrOutput.innerHTML = '';
          canvas.style.maxWidth = '100%';
          canvas.style.height = 'auto';
          qrOutput.appendChild(canvas);
          if(qrDownloadBtn){
            qrDownloadBtn.href = canvas.toDataURL('image/png');
            qrDownloadBtn.classList.remove('is-hidden');
          }
        }

        if(logoDataUrl){
          var img = new Image();
          img.onload = function(){
            var logoSize = size * 0.22;
            var lx = (size - logoSize) / 2;
            var ly = (size - logoSize) / 2;
            var pad = logoSize * 0.16;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(lx - pad, ly - pad, logoSize + pad * 2, logoSize + pad * 2);
            ctx.drawImage(img, lx, ly, logoSize, logoSize);
            finish();
          };
          img.onerror = finish;
          img.src = logoDataUrl;
        } else {
          finish();
        }
      }

      qrBtn.addEventListener('click', renderQR);
      qrInput.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); renderQR(); }
      });
    }

    /* ================================================================
       KÂR / ZARAR TAKİP UYGULAMASI (multi-product P&L app)
       ================================================================ */
    var productBody = document.getElementById('plProductBody');
    if(productBody){
      var expenseBody = document.getElementById('plExpenseBody');
      var addProductBtn = document.getElementById('plAddProduct');
      var addExpenseBtn = document.getElementById('plAddExpense');
      var expenseChips = document.querySelectorAll('.expense-chip');
      var chartCanvas = document.getElementById('plChart');

      var fmt = function(n){
        var sign = n < 0 ? '-' : '';
        return sign + Math.abs(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
      };

      function productRow(name, price, cost, qty){
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td><input type="text" class="pl-cell" data-field="name" placeholder="Ürün adı" value="' + (name || '') + '"></td>' +
          '<td><input type="number" class="pl-cell" data-field="price" min="0" step="0.01" value="' + (price || 0) + '"></td>' +
          '<td><input type="number" class="pl-cell" data-field="cost" min="0" step="0.01" value="' + (cost || 0) + '"></td>' +
          '<td><input type="number" class="pl-cell pl-cell-qty" data-field="qty" min="1" step="1" value="' + (qty || 1) + '"></td>' +
          '<td class="pl-cell-out" data-out="profit">0,00 ₺</td>' +
          '<td><button type="button" class="pl-row-remove" aria-label="Sil">&times;</button></td>';
        return tr;
      }

      function expenseRow(name, amount){
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td><input type="text" class="pl-cell" data-field="name" placeholder="Gider adı" value="' + (name || '') + '"></td>' +
          '<td><input type="number" class="pl-cell" data-field="amount" min="0" step="0.01" value="' + (amount || 0) + '"></td>' +
          '<td><button type="button" class="pl-row-remove" aria-label="Sil">&times;</button></td>';
        return tr;
      }

      function drawChart(gelir, gider, netKar){
        if(!chartCanvas) return;
        var ctx = chartCanvas.getContext('2d');
        var w = chartCanvas.width = chartCanvas.clientWidth * 2;
        var h = chartCanvas.height = chartCanvas.clientHeight * 2;
        ctx.clearRect(0, 0, w, h);

        var vals = [
          { label: 'Gelir', value: Math.max(gelir, 0), color: '#6ea23f' },
          { label: 'Gider', value: Math.max(gider, 0), color: '#c0503f' },
          { label: 'Net Kâr', value: netKar, color: netKar >= 0 ? '#8bc158' : '#c0503f' }
        ];
        var maxVal = Math.max(gelir, gider, Math.abs(netKar), 1);
        var barW = w / vals.length * 0.42;
        var gap = w / vals.length;
        var baseY = h - 40;
        var maxBarH = h - 80;

        ctx.font = (24) + 'px Archivo, sans-serif';
        ctx.textAlign = 'center';

        vals.forEach(function(v, i){
          var barH = Math.max((Math.abs(v.value) / maxVal) * maxBarH, 4);
          var x = gap * i + (gap - barW) / 2;
          var y = baseY - barH;
          ctx.fillStyle = v.color;
          ctx.beginPath();
          if(ctx.roundRect){ ctx.roundRect(x, y, barW, barH, 8); } else { ctx.rect(x, y, barW, barH); }
          ctx.fill();
          ctx.fillStyle = 'rgba(150,160,150,0.9)';
          ctx.fillText(v.label, x + barW / 2, baseY + 30);
          ctx.fillStyle = '#eef1ea';
          ctx.fillText(fmt(v.value).replace(' ₺','₺'), x + barW / 2, y - 12 < 20 ? 20 : y - 12);
        });
      }

      function recalc(){
        var totalRevenue = 0, totalCost = 0, totalExpense = 0;

        productBody.querySelectorAll('tr').forEach(function(tr){
          var price = parseFloat(tr.querySelector('[data-field="price"]').value) || 0;
          var cost = parseFloat(tr.querySelector('[data-field="cost"]').value) || 0;
          var qty = parseFloat(tr.querySelector('[data-field="qty"]').value) || 0;
          var rowProfit = (price - cost) * qty;
          totalRevenue += price * qty;
          totalCost += cost * qty;
          var out = tr.querySelector('[data-out="profit"]');
          out.textContent = fmt(rowProfit);
          out.className = 'pl-cell-out ' + (rowProfit >= 0 ? 'up' : 'down');
        });

        if(expenseBody){
          expenseBody.querySelectorAll('tr').forEach(function(tr){
            var amount = parseFloat(tr.querySelector('[data-field="amount"]').value) || 0;
            totalExpense += amount;
          });
        }

        var grossProfit = totalRevenue - totalCost;
        var netProfit = grossProfit - totalExpense;
        var margin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;

        var setStat = function(id, value, colorize){
          var el = document.getElementById(id);
          if(!el) return;
          el.textContent = typeof value === 'string' ? value : fmt(value);
          if(colorize) el.className = 'summary-value ' + (value >= 0 ? 'up' : 'down');
        };

        setStat('sumRevenue', totalRevenue, false);
        setStat('sumCost', totalCost, false);
        setStat('sumGrossProfit', grossProfit, true);
        setStat('sumExpense', totalExpense, false);
        setStat('sumNetProfit', netProfit, true);
        var marginEl = document.getElementById('sumMargin');
        if(marginEl){
          marginEl.textContent = margin.toFixed(1).replace('.', ',') + '%';
          marginEl.className = 'summary-value ' + (margin >= 0 ? 'up' : 'down');
        }

        drawChart(totalRevenue, totalExpense, netProfit);
      }

      productBody.appendChild(productRow('', 0, 0, 1));
      if(expenseBody){
        expenseBody.appendChild(expenseRow('Kira', 0));
      }

      if(addProductBtn){
        addProductBtn.addEventListener('click', function(){
          productBody.appendChild(productRow('', 0, 0, 1));
          recalc();
        });
      }
      if(addExpenseBtn){
        addExpenseBtn.addEventListener('click', function(){
          expenseBody.appendChild(expenseRow('', 0));
          recalc();
        });
      }
      expenseChips.forEach(function(chip){
        chip.addEventListener('click', function(){
          expenseBody.appendChild(expenseRow(chip.getAttribute('data-name'), 0));
          recalc();
        });
      });

      document.addEventListener('click', function(e){
        if(e.target.classList.contains('pl-row-remove')){
          var tr = e.target.closest('tr');
          var body = tr.parentElement;
          if(body === productBody && body.children.length <= 1) return;
          tr.remove();
          recalc();
        }
      });
      document.addEventListener('input', function(e){
        if(e.target.closest('#plProductBody, #plExpenseBody')){
          recalc();
        }
      });

      window.addEventListener('resize', recalc);
      recalc();
    }

  });
})();
