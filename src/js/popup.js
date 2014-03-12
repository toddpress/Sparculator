function roundToQuarter(float) {
	rounded = Math.round(float*4)/4;
	return rounded;
}

function createTimesObject(inputs) {
	var fT, sT, lt, times;

	sT = $(inputs[0]).timepicker('getTime');
	fT = $(inputs[1]).timepicker('getTime');
	lt = $(inputs[2]).val();

	// Progel
	var s = new Date(sT).toLocaleTimeString().toLowerCase().replace(':00 ', ''),
		f = new Date(fT).toLocaleTimeString().toLowerCase().replace(':00 ', ''),
		t = roundToQuarter(((fT - sT) / 3600000) - (lt/60)),
		adjustedTime = t > 0 
						? t 
						: ( fT > sT ? t : t+24 );
	times = {
		start: s,
		finish:	f,
		lunch: lt,
		total: adjustedTime
	}

	return times;
}

function addTd(val) {
	val = '<td>'+val+'</td>';
	return val;
}

function updateTableRow(day) {
	var days = localStorage,
		d = JSON.parse(days[day]),
		el = $('#'+day);

	el.empty().append(addTd(day) + addTd(d.start) + addTd(d.finish) + addTd(d.lunch + 'min(s)') + addTd(d.total)); 
}

function refreshTotals() {
	var totalHrs = 0.00;
	$('tbody tr td:last-child').each(function(i, el){
		var text = $(el).text() == '--' ? 0 : $(el).text();
		totalHrs += parseFloat(text);
	});
	$('tfoot td').text(totalHrs+'hrs');
}

$(function(){
	var now = new Date(Date.now()),
		day = now.getDay(),
		weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
		today = weekDays[day],
		iStart = $("#start"),
		iFinish = $("#finish"),
		iLunch = $("#lunch"),
		days, times, total;

	// localStorage.clear();
	if (days = localStorage) {
		for (day in days){
			var d = days[day] ? JSON.parse(days[day]):null;
			updateTableRow(day);
			if (d && day == today) {
				iStart.val(d.start);
				iFinish.val(d.finish);
				iLunch.val(d.lunch);
				$('#addTime').text('Update');
			}  
		}
	}
	
	$('input[type=text]').timepicker({forceRoundedTime:true, step:15, selectOnBlur:true, minTime:'6:00am'});
	$('tbody tr[id='+today+']').addClass('active');
	refreshTotals(),

	$('table').on('click', 'tr[id]', function(e){
		var tDay = $(this).attr('id'),
			data = days[tDay] ? JSON.parse(days[tDay]) : null;

		$('.active').removeClass('active');
		$(this).addClass('active');

		if (!data) {
			$('#addTime').text('Add');
			$('input').val('');
		} else {
			$('#addTime').text('Update');
			iStart.val(data['start']);
			iFinish.val(data['finish']);
			iLunch.val(data['lunch']);
		}
	});

	$('form').submit(function(e) {
		e.preventDefault();
		today = $('tr.active').attr('id');	
		times = createTimesObject($('input'));
		$.when(localStorage.setItem(today, JSON.stringify(times))).then(function() {
			$('input').val('');
			updateTableRow(today);
			refreshTotals();
		});	
	});
});