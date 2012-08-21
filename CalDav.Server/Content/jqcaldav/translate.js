var languages = {};

function loadLanguage ( lang, callback )
{
	if ( (new RegExp("[./]")).test(lang) )
		return;
	$.ajax({url:jqcaldavPath+String(lang).toLowerCase()+'.js',async:false, dataType:"json",success:function(d){
			if (d.ui != undefined)
			{
				languages[lang] = d;
				if ( typeof ( callback ) == "function" )
					callback ( lang );
				return ;
			}
      if ( /.-./.test(lang) )
      {
			  $.ajax({url:jqcaldavPath+String(lang).replace(/-.*/,'').toLowerCase()+'.js',async:false, dataType:"json",success:function(d){
			    if (d.ui != undefined)
						{
							languages[lang] = d;
							if ( typeof ( callback ) == "function" )
								callback ( lang );
							return ;
						}
						if ( typeof ( callback ) == "function" )
							callback ( false );
					},error:function(){alert('not found');}
					});
      }
      else
      {
        if ( typeof ( callback ) == "function" )
          callback ( false );
      }
		},error:function()
    {
      if ( /.-./.test(lang) )
      {
			  $.ajax({url:jqcaldavPath+String(lang).replace(/-.*/,'').toLowerCase()+'.js',async:false, dataType:"json",success:function(d){
			    if (d.ui != undefined)
						{
							languages[lang] = d;
							if ( typeof ( callback ) == "function" )
								callback ( lang );
							return ;
						}
						if ( typeof ( callback ) == "function" )
							callback ( false );
					},error:function(){alert('not found');}
					});
      }
      else
      {
        alert('not found');
        if ( typeof ( callback ) == "function" )
          callback ( false );
      }
    }
		});
}

function showTranslation ( lang )
{
	if ( lang == false )
	{
		alert ( 'translation file corrupt, missing or otherwise broken' );
		return ;
	}
	var container = $('<div id="translator" class="calpopup" data-lang="'+lang+'"></div>');
	var ul = $('<ul></ul>');
	var li = $('<li>'+ i +'</li>');
	$(ul).append('<li><span<span class="value">Translation</span></li>');
	for ( var i in defaults )
	{
		var li = $('<li>'+ i +'</li>');
		var ul2 = $('<ul section="'+i+'"></ul>');
		for ( var j in defaults[i] )
		{
			if ( typeof ( defaults[i][j] ) != 'string' )
			{
				var li2 = $('<li entry="'+j+'"></li>');
				var ul3 = $('<ul section="'+j+'"></ul>');
				for ( var k in defaults[i][j] )
				{
					if ( languages[lang] != undefined && languages[lang][i] != undefined && languages[lang][i][j] != undefined && languages[lang][i][j][k] )
						var li3 = $('<li entry="'+ k +'"><span class="label">'+ k +'</span><span class="default value">'+ defaults[i][j][k] +'</span><span class="value '+lang+'" contenteditable="true" >'+ languages[lang][i][j][k] +'</span></li>');
					else
						var li3 = $('<li entry="'+ k +'"><span class="label">'+ k +'</span><span class="default value">'+ defaults[i][j][k] +'</span><span class="value '+lang+' missing" contenteditable="true" >'+ defaults[i][j][k] +'</span></li>');
					$(ul3).append(li3);
				}
				$(li2).append(ul3);
				$(ul2).append(li2);
			}
			else
			{
				if ( languages[lang] != undefined && languages[lang][i] != undefined && languages[lang][i][j] )
					var li2 = $('<li entry="'+ j +'"><span class="label">'+ j +'</span><span class="default value">'+ defaults[i][j] +'</span><span class="value '+lang+'" contenteditable="true" >'+ languages[lang][i][j] +'</span></li>');
				else
					var li2 = $('<li entry="'+ j +'"><span class="label">'+ j +'</span><span class="default value">'+ defaults[i][j] +'</span><span class="value '+lang+' missing" contenteditable="true" >'+ defaults[i][j] +'</span></li>');
				$(ul2).append(li2);
			}
		}
		$(li).append(ul2);
		$(ul).append(li);
	}
	$(ul).css({'max-height':'90%',overflow:'scroll'});
	$(container).append(ul);
	$(container).append('<div class="button delete">translate!</div>');
	$(container).append('<div class="button done">close</div>');
	$('.delete',container).click(saveTranslation);
	$('.done',container).click(function(){$('#translator').remove();});
	$(container).css({ top: 50 ,left: window.innerWidth *.2 ,'min-height':200,'min-width':400,'height': window.innerHeight - 100 ,'width': window.innerWidth * .6,position: 'absolute','z-index': 150 });
	$('#translator').remove();
	draggable(container);
	$('#calwrap').append(container);

}

function saveTranslation ()
{
	var newlang = {};
	var lang = $('#translator').data('lang');
	if ( lang == undefined || lang.length < 2 )
	{
		alert( 'bad language name' );
		return;
	}
	for ( var i in defaults )
	{
		newlang[i] = {};
		for ( var j in defaults[i] )
		{ 
			if ( typeof ( defaults[i][j] ) != 'string' )
			{
				 newlang[i][j] = {};
				for ( var k in defaults[i][j] )
					newlang[i][j][k] = $('#translator ul[section="'+i+'"] li[entry="'+j+'"] li[entry="'+k+'"] .value.'+lang+':first').text();
			}
			else
				newlang[i][j] = $('#translator ul[section="'+i+'"] li[entry="'+j+'"] .value.'+lang+':first' ).text();
		}
	}
	languages[lang] = newlang;
	$('#translator ul').replaceWith ( '<div id="translatedText">'+JSON.stringify(newlang)+'</div>');
	$('#translatedText').css({'max-height':'50%',overflow:'scroll'});
	$('#translator').append('<div class="button save" style="width: 40%; float: left;" title="should work with calendarserver">Save to Server</div>');
	$('#translator').append('<div class="button email" style="width: 40%; float: left; " title="should work with calendarserver"><a href="mailto:rob+jqcaldav@boxacle.net?subject=jqcaldav translation for '+ lang+ '&body='+encodeURIComponent(JSON.stringify(newlang))+'" >Email translation</a></div>');
	$('#translator .save').click(function (e)
		{
			var txt = $('#translatedText').text(); 
			$.put({url:jqcaldavPath+ lang + '.js' ,username:$.fn.caldav.options.username,password:$.fn.caldav.options.password,data:txt,
				complete:function(r,s)
				{
					if ( s == 'success' )
					{
						$('#translator .save').remove();
						$('#translatedText').text('Saved! Please commit and send or push the changes, thanks for your help.');
					}
					else
					{
						$('#translatedText').css({outline:'2px solid red'});
						$('#translatedText').attr('contenteditable','true');
						var range = document.createRange();
						range.selectNodeContents($('#translatedText')[0]);
						var sel = window.getSelection();
						sel.removeAllRanges();
						sel.addRange(range);
						alert('failed, please email the contents of the red highlighted box instead');
						r.abort();
						return false;
					}

				}
			});
		}
	);
}

function translate(lang)
{
	loadLanguage(lang,showTranslation);
}

function startTranslating ()
{
	var container = $('<div id="starttranslator" class="calpopup" ></div>');
	$(container).append('<div><span class="label">Language</span><span class="value" contenteditable="true">'+String(navigator.language?navigator.language:navigator.userLanguage).toLowerCase()+'</span></div>');
	$(container).append('<div class="button delete">translate!</div>');
	$(container).append('<div class="button done">close</div>');
	$('.delete',container).click(function(e){var lang = $('#starttranslator .value').text(); if ( lang != '' && lang.length > 1 ){ translate(lang);$('#starttranslator').remove();}else{('#starttranslator .value').css('outline','1px solid red');}});
	$('.done',container).click(function(){$('#starttranslator').remove();});
	$(container).css({ top:  window.innerHeight * .4 ,left: window.innerWidth *.3 ,'min-height':200,'min-width':400,'height': window.innerHeight *.2 ,'width': window.innerWidth * .4,position: 'absolute','z-index': 150 });
	draggable(container);
	$('#calwrap').append(container);
	$('#starttranslator .value').focus();
}
