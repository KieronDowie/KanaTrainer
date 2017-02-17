var deck = [];
var refDeck = [];
var type = '';
var level = '';
var stage = 'start';
$(document).ready(function(){
	$('.optionmenu li').click(function(e){
		var elem = e.target;
		while (elem.tagName != 'LI') elem = elem.parentNode;
		var name = $(elem).attr('name');
		if (name == 'learn')
		{
			loadPage('learn.html');
		}
		else
		{
			type = name;
			loadPage('advanced.html');
		}
	});
});
function loadPage(page)
{
	var finished = false;
	var delay = 200;
	$('.container').animate({'opacity':0},delay, function(){
		finished = true;
	})
	$.ajax('html/'+page,{
		async:false,
		success:function(res)
		{			
			var fadeIn = function()
			{
				if (!finished)
				{	
					setTimeout(fadeIn,200);
				}
				else
				{
					$('.container').html(res);
					$('.container').animate({'opacity':1},delay);
				}				
			}
			fadeIn();
		}
	});
}
function englishTestNeeded()
{
	var pretimes = getTimes();
	if (pretimes)
	{
		times = pretimes;
		$('p').html('You are now able to test your kana recognition. Press the button when you are ready, then typo the romaji for the kana character shown and press enter. If you don\'t know a character, simply press enter to move to the next one. Good luck!');
		$('button').click(startKanaTest);
	}
	else
	{
		$('p').html('Before you can test your kana recognition, you will need to take the test using romaji characters. This will determine your typing speed, and will be used to determine how long it takes to recognize a kana. Just repeat the letters you see and press enter.');
		$('button').click(startEnglishTest);
	}
}
function startEnglishTest()
{
	stage = 'english';
	$('.test').html('');
	chooseDeck(true);
	shuffleItems();
	addItem(deck.splice(0,1)[0]);
	startTimer();	
}
function chooseDeck(eng)
{
	if (type == 'hiragana')
	{
		if (level == 'advanced')
		{
			setDeck(hiragana.normal,hiragana.advanced);
		}
		else
		{
			setDeck(hiragana.normal);
		}
	}
	else if (type == 'katakana')
	{
		if (level == 'advanced')
		{
			setDeck(katakana.normal,katakana.advanced);
		}
		else
		{
			setDeck(katakana.normal);
		}
	}
	else if (type == 'hiragana&katakana')		
	{
		if (level == 'advanced')
		{
			setDeck(hiragana.normal,hiragana.advanced, katakana.normal,katakana.advanced);
		}
		else
		{
			setDeck(hiragana.normal, katakana.normal);
		}
	}
	if (eng)
	{
		for (i in deck)
		{
			deck[i].kana = deck[i].romaji;
		}
	}
}
function startKanaTest()
{
	stage = 'kana';
	$('.test').html('');
	chooseDeck();
	shuffleItems();
	addItem(deck.splice(0,1)[0]);
	startTimer();
}
function setDeck()
{
	deck = [];
	for (i=0;i<arguments.length;i++)
	{
		var chosen = arguments[i];
		for (j in chosen)
		{
			deck.push({kana:j,romaji:chosen[j]});
		}
	}
	refDeck = deck.slice();
}
function shuffleItems()
{
	deck = Shuffle(deck);
}
function addItem(arr)
{
	var li = $('<li answer="'+arr.romaji+'"></li>');
	var kana = $('<div class="kana">');
	kana.html('<p>'+arr.kana+'</p>');
	var input = $('<input type="text">');
	input.keypress(function(e){
		if (e.which == 13)
		{
			checkItem();
		}
	});
	var timer = $('<span class="timer">');
	timer.html('0.0');	
	li.append(kana);
	li.append(input);
	li.append(timer);
	var old = $('.current');
	var inp =  $('.current input');
	inp.prop('disabled','true');
	old.removeClass('current');
	li.addClass('current');
	$('.test').append(li);
	input.focus();
	time = 0;
}
function storeTime(answer,time)
{
	if (stage == 'english')
	{
		times[answer] = time;		
	}
	else if (stage == 'kana')
	{
		kanatimes[answer] = time;
	}
}
function Shuffle(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};
function checkItem()
{
	var li = $('.current');
	var answer = li.attr('answer');
	var check = $('.current input').val();
	$('.current input').val(check.trim());
	if (answer == check.toLowerCase().trim())
	{
		$('.current input').addClass('correct');
		if (stage == 'kana')
		{
			var prev = times[answer];
			if (time > prev)
			{
				$('.current .timer').addClass('slower');
				$('.current .timer').html((prev-time).toFixed(2));
			}
			else
			{
				$('.current .timer').addClass('faster');
				$('.current .timer').html((prev-time).toFixed(2));
			}
		}
	}
	else
	{
		$('.current input').addClass('incorrect');
		if (stage == 'kana')
		{
			$('.current .timer').addClass('slower');
			$('.current .timer').html('');
			incorrectAnswers[answer] = true;
		}
	}
	showTime();
	if (deck.length > 0)
	{
		var item = deck.splice(0,1)[0];
		addItem(item);
	}
	else
	{
		$('.current input').prop('disabled','true');
		deckFinished();
	}
}
function deckFinished()
{
	stopTime();
	if (stage == 'english')
	{
		var total = 0;		
		for (i in times)
		{
			total+=times[i];
		}
		var str = "Total time: <h1>"+total.toFixed(2)+"</h1>";
		var info = $('<li>');
		info.html(str);
		var button = $('<button>');
		var li = $('<li>')
		li.append(button);
		button.html('Start Test');
		button.click(startKanaTest);
		$('.test').append(info);
		$('.test').append(li);
		saveTimes();
	}
	else if (stage == 'kana')
	{
		var total = 0;		
		for (i in kanatimes)
		{
			total+=kanatimes[i];
		}
		var str = "Total time: <h1>"+total.toFixed(2)+"</h1>";
		var info = $('<li>');
		info.html(str);
		var button = $('<button>');
		var li = $('<li>')
		li.append(button);
		button.html('See problems');
		button.click(problemAreas);
		$('.test').append(info);
		$('.test').append(li);
	}
}
function problemAreas()
{
	$('.test').html('');
	var ordered = [];
	for (i in kanatimes)
	{
		ordered.push({kana:i,time:times[i]-kanatimes[i]});
	}
	ordered.sort(function(a,b){		
		return (a.time-b.time);
	});
	for (i in ordered)
	{
		var k = ordered[i].kana;
		if (incorrectAnswers[k])
		{
			var moving = ordered.splice(i,1);
			moving[0].incorrect = true;		
			ordered.splice(0,0,moving[0]);
		}
	}
	var p = $('<p>');
	p.html('Kana test complete! You will see your results down below. The higher the result on the list, the more work is needed to get it closer to your romaji reading speed.');
	$('.test').append(p);
	for (i in ordered)
	{
		var li = $('<li>');
		var kana = $('<div class="kana">');		
		console.log(ordered[i]);
		kana.html('<p>'+getKana(ordered[i].kana)+'</p>');
		console.log(ordered[i]);
		if (ordered[i].incorrect)
		{
			kana.addClass('incorrect');
		}
		var p = $('<p class="result">');
		if (ordered[i].time >= 0)
		{
			p.addClass('faster');
		}
		else
		{
			p.addClass('slower');
		}
		p.html(ordered[i].time.toFixed(2));
		li.append(kana);
		li.append(p);
		$('.test').append(li);
	}
}
var time;
var timer = true;
function startTimer()
{
	time = 0.0;
	timer = true;
	var tick = function()
	{
		if (timer)
		{
			time+=0.1;		
			showTime();	
		}
		if ($('.current').length != 0)
		{
			if (timer)
			{
				setTimeout(tick, 100);	
			}
		}
	};
	tick();
}
function showTime()
{
	$('.current .timer').html(time.toFixed(2));
	var li = $('.current');
	var answer = li.attr('answer');
	storeTime(answer, time);
}
function stopTime()
{
	timer = false;
}
function saveTimes()
{
	var j = JSON.stringify(times);
	setCookie(type+level,j,30);
}
function getTimes()
{
	var c = getCookie(type+level);
	if (c != "")
	{
		return JSON.parse(c);
	}
	else
	{
		return undefined;
	}
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function getKana(char)
{
	for (p in refDeck)
	{
		if (refDeck[p].romaji == char)
		{
			return refDeck[p].kana;
		}
	}
}