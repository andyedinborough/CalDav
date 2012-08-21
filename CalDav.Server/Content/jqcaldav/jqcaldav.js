// Copyright (c) 2011, Rob Ostensen ( rob@boxacle.net )
// See README or http://boxacle.net/jqcaldav/ for license
var cd,hw,fhw,jqcaldavPath,localTimezone,debug=false,alerts=[],timezoneInit = false, lang;
var settings={twentyFour:true,start:Zero().setUTCHours(6),end:Zero().setUTCHours(22),'update frequency':300,weekStart:0,usealarms:false,shortAllDay:false};
var defaultColors = ['#00D','#0D0','#D00','#08D','#0D8','#D80'];

var months,weekdays,dropquestion,deletequestion,fieldNames,valueNames,subscriptions;
var perf=[[],[],[],[],[],[],[],[],[]];
var globalEvents = {href:{}};
settings.start = new Date(Zero().setUTCHours(6));
settings.end = new Date(Zero().setUTCHours(22));
var abbvr={abbv:[],names:[],offsets:[],count:0};
function loadTZ ( )
{
  if ( abbvr.count < 1 )
  {
    $.ajax({url:jqcaldavPath+'tz/abbvr.tz',async:false, dataType:"text",success:function(d){
      var t = String(d).split ("\n");
      abbvr.count=t.length;
      for (var i=0;i<t.length;i++)
      {
        var p = t[i].split(',');
        abbvr.abbv.push(p[0]);
        abbvr.names.push(p[1]);
        abbvr.offsets.push(Number(p[2]));
      }
    }});
  }
}
function getTZ ( d )
{
  if ( ! d || ! d.getDate )
    var d = new Date();
  var offset = 0 - ( parseInt(d.getTimezoneOffset()/60)*100 + d.getTimezoneOffset()%60 );
  var ab = d.toLocaleString().replace(/^.*\s/,'');
  if ( debug ) console.log( 'searching ' + abbvr.abbv.length + ' timezones for ' + ab + ' (' + offset + ') found ' + abbvr.abbv.indexOf(ab)  );
  for ( var i = 0; i < abbvr.abbv.length; i++ )
  { 
    if ( abbvr.offsets[i] == offset )
      return {abbv:abbvr.abbv[i],name:abbvr.names[i],offset:abbvr.offsets[i]};
  }
  return false;
}

var defaults={ui:{calendar:"Calendars",todos:"To Do","show":"Show","sort":"Sort","add":"Add",settings:"Settings",subscribe:"Subscribe",today:"Today",week:"Week",month:"Month",start:"Day Starts",end:"Day Ends",twentyFour:"24 Hour Time",username:'Username',password:'Password','go':'go','New Event':'New Event','New Todo':'New Todo','New Journal':'New Journal',"alarm":"alarm","done":"Done","delete":"Delete","name":"name","color":"color","description":"description","url":"url","privileges":"privileges","logout":"Logout","new calendar":"New Calendar","yes":"yes","no":"no","logout error":"Error logging out, please CLOSE or RESTART your browser!","owner":"Owner","subscribed":"Subscribed","lock failed":"failed to acquire lock, may not be able to save changes",loading:'working','update frequency':'update frequency',usealarms:"Enable Alarms","listSeparator":",","manual":"manual","bind":"bind","unbind":"unbind","refresh":"refresh","user":"User","path":"Path","source":"Source","available":"Show Availibility","resolve":"Next Availible","inviteFrom":"from","invitations":"Invitations","accept":"accept","maybe":"maybe","decline":"decline","weekStart":"Week Starts on","shortAllDay":"Collapse Events that span Multiple Days","shift click to edit":"Shift-Click to Edit"},
  months:["January","February","March","April","May","June","July","August","September","October","November","December"],
  weekdays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  notifyquestion:["Do you want to notify",["yes","no"]],
  dropquestion:["Do you want to move",["All occurences","This one occurence"]],
  deletequestion:["Do you want to delete ",["All occurences","Delete this one occurence"]],
  deleteCalQuestion:["Are you sure you want to delete ",["No","Delete Calendar"]],
  fieldNames:{summary:"summary",dtstart:"from",dtend:"to",duration:"duration",rrule:"repeat",rdate:"repeat on",transp:"busy",due:"due",completed:"completed",
    status:"status",resources:"resources",priority:"priority","percent-complete":"percent complete",location:"location",geo:"coordinates",description:"description",
    comment:"comment","class":"class",categories:"catagories",attach:"attachment",attendee:"attendee",contact:"contact",organizer:"organizer","related-to":"related to", 
    url:"url",action:"action",repeat:"repeat",trigger:"trigger","last-modified":"last modified","request-status":"request status",'x-calendarserver-private-comment':"private comment","x-calendarserver-access":"privacy"},
  valueNames:{"TRANSPARENT":"transparent","OPAQUE":"opaque","TENTATIVE":"tentative","CONFIRMED":"confirmed","CANCELLED":"cancelled","NEEDS-ACTION":"needs-action",
    "COMPLETED":"completed","IN-PROCESS":"in-process","DRAFT":"draft","FINAL":"final","CANCELLED":"cancelled","PUBLIC":"public","PRIVATE":"private","RESTRICTED":"restricted",
    "CONFIDENTIAL":"confidential","AUDIO":"sound","DISPLAY":"message","NONE":"none","past due":"past due","upcoming":"upcoming"},
  "durations":{"minutes before":"minutes before","hours before":"hours before","days before":"days before","weeks before":"weeks before","minutes after":"minutes after","hours after":"hours after","days after":"days after","weeks after":"weeks after","on date":"on date"},
  "recurrenceUI":{"YEAR":"year","MONTH":"month","MONTHDAY":"day of month","YEARDAY":"day of year","WEEKNO":"week number","WEEK":"week","DAI":"day","HOUR":"hour","MINUTE":"minute","SECOND":"second","day":"day","time":"time","times":"times","until":"until","every":"every","on":"on","position0":"sixth to last","position1":"fifth to last","position2":"forth to last","position3":"third to last","position4":"second to last","position5":"last","position6":"","position7":"first","position8":"second","position9":"third","position10":"forth","position11":"fifth","position12":"sixth",  
  },
  "privileges":{"all":"all","bind":"bind","unbind":"unbind","unlock":"unlock","read":"read","acl":"acl","free-busy":"free-busy","privileges":"privileges","write":"write","content":"content","properties":"properties","acl":"acl","schedule-send":"schedule-send","invite":"invite","reply":"reply","freebusy":"freebusy","schedule-deliver":"schedule-deliver","invite":"invite","reply":"reply","query-freebusy":"query-freebusy"}};

var ui=defaults.ui, months=defaults.months, weekdays=defaults.weekdays, notifyquestion=defaults.notifyquestion, dropquestion=defaults.dropquestion,
deletequestion=defaults.deletequestion, deleteCalQuestion=defaults.deleteCalQuestion, fieldNames=defaults.fieldNames, valueNames= defaults.valueNames,privileges=defaults.privileges ,durations=defaults.durations;
var recurrenceUI=defaults.recurrenceUI;

$(document).ready ( function () {
    var here = $('.jqcaldav:eq(0)');
    jqcaldavPath = $('script[src*=jqcaldav]').attr('src').replace(/jqcaldav.js/,'');
    lang = String(navigator.language?navigator.language:navigator.userLanguage).toLowerCase();
    $.ajax({url:jqcaldavPath+lang+'.js',async:false, dataType:"json",success:function(d){
        if (d.ui != undefined)
        {
          ui = $.extend(true, ui,d.ui);
          months = $.extend(true, months,d.months);
          weekdays = $.extend(true, weekdays,d.weekdays);
          notifyquestion = $.extend(true, notifyquestion,d.notifyquestion);
          dropquestion = $.extend(true, dropquestion,d.dropquestion);
          deletequestion = $.extend(true, deletequestion,d.deletequestion);
          fieldNames = $.extend(true, fieldNames,d.fieldNames);
          valueNames = $.extend(true, valueNames,d.valueNames);
          durations = $.extend(true, durations,d.durations);
          recurrenceUI = $.extend(true, recurrenceUI,d.recurrenceUI);
          deleteCalQuestion = $.extend(true, deleteCalQuestion,d.deleteCalQuestion);
          privileges = $.extend(true, privileges,d.privileges);
        }
        else
          {ui=defaults.ui; months=defaults.months; weekdays=defaults.weekdays; dropquestion=defaults.dropquestion;
          deletequestion=defaults.deletequestion; fieldNames=defaults.fieldNames; valueNames= defaults.valueNames;recurrenceUI=d.recurrenceUI;}},
      error:function()
        {
          $.ajax({url:jqcaldavPath+lang.replace(/-.*/,'').toLowerCase()+'.js',async:false, dataType:"json",success:function(d){
          if (d.ui != undefined)
          {
            ui = $.extend(true, ui,d.ui);
            months = $.extend(true, months,d.months);
            weekdays = $.extend(true, weekdays,d.weekdays);
            dropquestion = $.extend(true, dropquestion,d.dropquestion);
            deletequestion = $.extend(true, deletequestion,d.deletequestion);
            fieldNames = $.extend(true, fieldNames,d.fieldNames);
            valueNames = $.extend(true, valueNames,d.valueNames);
            durations = $.extend(true, durations,d.durations);
            recurrenceUI = $.extend(true, recurrenceUI,d.recurrenceUI);
            deleteCalQuestion = $.extend(true, deleteCalQuestion,d.deleteCalQuestion);
            privileges = $.extend(true, privileges,d.privileges);
          }
          else
          {
            ui=defaults.ui; months=defaults.months; weekdays=defaults.weekdays; dropquestion=defaults.dropquestion;
            deletequestion=defaults.deletequestion; fieldNames=defaults.fieldNames; valueNames= defaults.valueNames;recurrenceUI=d.recurrenceUI;}
          },error:function()
          {
            ui=defaults.ui; months=defaults.months; weekdays=defaults.weekdays; dropquestion=defaults.dropquestion;
            deletequestion=defaults.deletequestion; fieldNames=defaults.fieldNames; valueNames= defaults.valueNames; recurrenceUI=defaults.recurrenceUI;
          }
        } );
    }});
    if ( $('.jqcaldav:eq(0)').data('debug') == 'true' ) debug = true;
    if ( $('.jqcaldav:eq(0)').data('wait') != 'true' ) 
    {
      $(here).append('<form id="cal_login" ><div style="max-width: 40%; min-width: 16em;margin: 30%; margin-top:1em; padding: 2em; -moz-border-radius: 1.5em; -webkit-border-radius: 1.5em; border-radius: 1.5em; ' +
        '-moz-box-shadow: 0px 0px 10px #888; -webkit-box-shadow: 0px 0px 10px #888; box-shadow: 0px 0px 10px #888; "><div id="cal_login_wrapper"><div style="text-align:center"><label for="name" style="width:50%;margin-left: -3em;display: block;float:left;'+
        'text-align: right; padding-right: 1em;">'+ui.username+'</label><input id="name" size="20" style="float: left;" autofocus /></div><div style="clear: left;text-align:center;"><label for="pass" style="width:50%;margin-left: -3em;'+
        'display: block;float:left;text-align: right; padding-right: 1em;">'+ui.password+'</label><input id="pass" size="20" type="password" style="float: left;"/></div><div><input id="go" size="20" type="button" value="'+ui.go+'" style="float: left;" /></div><div>&nbsp;</div></div></div></form>');
        $('#cal_login input:eq(0)').focus();
        $('#cal_login').submit(function(e){console.log('doinging it');doit(e);return false;});
        $('#cal_login #go').click(function (e){doit(e); return false; });
        $('#cal_login input').keypress(function (e){if (e.keyCode=='13'){doit(e); return false; }});
    }
    else
    {
      $(here).append('<form id="cal_login" ><input id="name" value="'+$('.jqcaldav:eq(0)').data('username')+'" /><input id="pass" value="'+$('.jqcaldav:eq(0)').data('password')+'" /></form>');
      doit();
    }
    if ( debug ) console.log(ui);
    loadTZ();
    localTimezone = getTZ();
    if ( debug ) console.log('local timezone should be: ' + localTimezone.name);
    } );

function visible ( e )
{
  var p = $(e).parents('body').andSelf();
  return $.grep(p,function(a,i){return $(a).css('display')!='none'}).length==p.length?true:false;
}

combine = function ( obj, o ) 
{
  for ( var x in o )
    if ( ! obj[x] )
      obj[x] = o[x];
  return obj; 
}

var extdepth = 0;

function doit ( e )
{
  if ( $('.jqcaldav:eq(0)').data('wait') == 'true' ) 
  {
    if ( $('.jqcaldav:eq(0)').data('username').length < 3 && $('.jqcaldav:eq(0)').data('password').length < 3 )
      return;
  }
  else if ( $('#name').val().length < 3 && $('#pass').val().length < 3 )
    return;
  else
  {
    $('.jqcaldav:eq(0)').data('username',$('#name').val());
    $('.jqcaldav:eq(0)').data('password',$('#pass').val());
  }
  if ( $('#wcal').length > 0 )
    $('#calwrap').remove();
  if ( $('.jqcaldav:first').data('caldavurl') == '' )
    $('.jqcaldav:first').data('caldavurl','/');
  $('#cal_login').fadeOut(99);
  var loading = $('<div id="caldavloading1" style="display:none;position:fixed;right:0;bottom:0;text-align: center; width:4em; background-color:black;color:white;-moz-border-top-left-radius:.5em;-webkit-border-top-left-radius:.5em;border-top-left-radius:.5em;opacity:.5;z-index:100;padding:.1em .4em;" data-loading="0" ><span>'+ui.loading+'</span></div>').appendTo(document.body);
  window.setTimeout(function()
  {
    var fd = $('.jqcaldav:first').data('fulldiscovery');
    if ( fd != 'true' )
      fd = false;
    else
      fd = true;
    cd = $(document).caldav ( { url: $('.jqcaldav:first').data('caldavurl'),fullDiscovery:fd, username:$('.jqcaldav:eq(0)').data('username'), password:$('.jqcaldav:eq(0)').data('password'), events: addEvents, todos: addToDos,eventPut: eventPut, eventDel: removeEvent, deletedCalendar: deletedCalendar, logout: logout, loading: $('#caldavloading1')}, loginFailed );
    $.fn.caldav.options.calendars = gotCalendars;
    $(document).caldav('getCalendars', {});

    $(window).unload ( logoutClicked ); 
    if (window.timezoneJS && timezoneJS != undefined && timezoneJS.timezone != undefined && timezoneInit == false ) 
    {
      timezoneInit = true;
      timezoneJS.timezone.zoneFileBasePath = jqcaldavPath+'tz';
      timezoneJS.timezone.init();
    }
  },100);
  if ( e )
    e.stopPropagation();
  return false;
}

function loginFailed (r,s)
{
  r.abort();
  $('#name,#pass').css('background-color', 'red').animate({'background-color': '#FFF'}, 300);
}

function logoutClicked ()
{
  if ( $('#calwrap').length > 0 || $.fn.caldav.options.username )
    $(document).caldav ( 'logout' );
}

function logout ()
{
  window.clearInterval($('#wcal').data('updateInterval'));
  for ( var i in alerts )
    window.clearTimeout(alerts[i]);
  $('#calwrap').remove();
  $('#cal_login').fadeIn();
  $('#name').val('');
  $('#pass').val('');
}

function gotCalendars ()
{
  if ( $('#wcal').length < 1 )
  {
    var ph = $.fn.caldav.collectionData[$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].cal].xml;
    var s = $('*['+$.fn.caldav.xmlNSfield+'=calendar-settings]:first',ph).text();
    if ( s.length > 20 )
    {
      $.extend(true,settings,JSON.parse( s ));
      settings.start = Zero().parseDate(settings.start);
      settings.end = Zero().parseDate(settings.end);
      if ( settings.calendars != undefined ) 
      {
        var tf = /false/i;
        for ( var i in settings.calendars )
        {
          if ( settings.calendars[i] !== false )
          {
            if ( tf.test(settings.calendars[i] ) )
              settings.calendars[i] = false;
            else
              settings.calendars[i] = true;
          }
        }
      }
    }
    $('.jqcaldav:first').append(buildcal());
    $(window).resize ( resize);
    $('#wcal').animate({scrollTop: ($('#calt tr:first')[0].clientHeight + 1)},250);
    $('#calpopup').removeData('clicked');
    getInbox();
    resize();
    s = $('*['+$.fn.caldav.xmlNSfield+'=calendar-subscriptions]:first',ph).text();
    if ( ! settings.shortAllDay )
    {
      styles.updateRule('.week .day ul.eventlist > li.multiday',{width: '100%'});
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+6),  .day ul.eventlist > li.multiday:nth-last-child(1n+6)  ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '50%'    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+11), .day ul.eventlist > li.multiday:nth-last-child(1n+11) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '33.34%' } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+16), .day ul.eventlist > li.multiday:nth-last-child(1n+16) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '25%'    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+21), .day ul.eventlist > li.multiday:nth-last-child(1n+21) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '20%'    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+26), .day ul.eventlist > li.multiday:nth-last-child(1n+26) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '16.7%'  } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+31), .day ul.eventlist > li.multiday:nth-last-child(1n+31) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '14.28%' } ); 
    }
    else
    {
      styles.updateRule('.week .day ul.eventlist > li.multiday',{width: null});

	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+6),  .day ul.eventlist > li.multiday:nth-last-child(1n+6)  ~ li.multiday', { 'margin-bottom': null, 'line-height': null    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+11), .day ul.eventlist > li.multiday:nth-last-child(1n+11) ~ li.multiday', { 'margin-bottom': null, 'line-height': null } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+16), .day ul.eventlist > li.multiday:nth-last-child(1n+16) ~ li.multiday', { 'margin-bottom': null, 'line-height': null    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+21), .day ul.eventlist > li.multiday:nth-last-child(1n+21) ~ li.multiday', { 'margin-bottom': null, 'line-height': null    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+26), .day ul.eventlist > li.multiday:nth-last-child(1n+26) ~ li.multiday', { 'margin-bottom': null, 'line-height': null  } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+31), .day ul.eventlist > li.multiday:nth-last-child(1n+31) ~ li.multiday', { 'margin-bottom': null, 'line-height': null } ); 


    }
    if ( s.length > 20 )
    {
      var nsubscriptions = JSON.parse( s );
      for ( var i in nsubscriptions )
      { 
        if ( nsubscriptions[i] == undefined  )
          continue;
        if ( subscriptions == undefined || ! subscriptions instanceof Object )
          subscriptions = [{name:nsubscriptions[i].name,url:nsubscriptions[i].url,'color':nsubscriptions[i].color,'order':nsubscriptions[i].order,'description':nsubscriptions[i].description}];
        else
          subscriptions.push({name:nsubscriptions[i].name,url:nsubscriptions[i].url,'color':nsubscriptions[i].color,'order':nsubscriptions[i].order,'description':nsubscriptions[i].description});
        fetchCalendar (nsubscriptions[i].url,nsubscriptions[i].name,nsubscriptions[i].color,nsubscriptions[i].order,nsubscriptions[i].description);
      }
    }
    if ( settings['update frequency'] > 0 )
    {
      calendarSync();
      $('#wcal').data('updateInterval',window.setInterval(calendarSync,settings['update frequency']*1000));
    }
  }
}

function calendarSync ()
{
  var cals = $(document).caldav('calendars');
  // TODO add getctag/sync token periodic check to refresh changed events
  // http://tools.ietf.org/html/draft-daboo-webdav-sync-05#section-3.1
  for ( var i=0; i< cals.length; i++)
  {
    // the dates used here are ONLY for client side so we know when to insert returned events 
    $(document).caldav('syncCollection',i,$('#wcal').data('firstweek'),$('#wcal').data('lastweek'));
  }
  getInbox();
}

function eventPut(r,s)
{
  if ( s != 'success' )
  {
    alert ('failed to save event to server');
    console.log(r);
  }
}

function draggable (e)
{
  $(e).addClass('draggable');
  $(e).bind('mousedown',function (evt)
      {
        if ( ! $(evt.target).hasClass('draggable') )
          return;
        if ( evt.pageX > $(this).offset().left + $(this).outerWidth() * .9 && evt.pageY > $(this).offset().top + $(this).outerHeight() * .9 )
          return true; // silly firefox 
        $(document.body).data('caldrag',{e:evt.target,x:evt.pageX-$(this).offset().left,y:evt.pageY-$(this).offset().top});
        var drag = function (evt) { var offsets = $(document.body).data('caldrag'); $(offsets.e).offset({left:evt.pageX-offsets.x,top:evt.pageY-offsets.y});return false;};
        $(document).bind('mouseup',function (evt) {$(document).unbind('mousemove',drag);$(document).unbind(evt); });
        $(document).bind('mousemove',drag);
        return false;
      });
}

var resize_delay=0,resize_time=50;
function resize ()
{
  $('#calsidebar, #caltodo').css({height: window.innerHeight });
  $('#callist').css({'max-height':window.innerHeight- ( $('.sidetitle').height() + $('.calfooter').height() + $('#calinvites').height() ) } );
  //$('#wcal,#calh,#calheader').css({width: $('#calwrap').width() - ( $('#calsidebar').width() +1 + $('#caltodo').width() +7 )} );
  $('#wcal').css({height: ( window.innerHeight - ( $('#wcal')[0].offsetTop + 2) ) });
  $('.timeline').css({height: ( window.innerHeight - ( $('#wcal')[0].offsetTop + 2) ) });
  if ( resize_delay != 0 )
    window.clearTimeout(resize_delay);
  resize_delay = window.setTimeout(update_weekview,resize_time);
  updateTimeline();
  //update_weekview();
}

function update_weekview ()
{
  //resize_delay=0;
  var started = new Date();
  var oldTop =  $('#wcal').scrollTop()/$('#wcal').height();
  styles.getStyleSheet ( 'calstyle' );
  var iH = ( window.innerHeight - ( $('#wcal')[0].offsetTop + 40) );
  styles.updateRule('.weekview .week',{height: iH +'px'});
  styles.updateRule('.weekview .weeknum',{height: iH +'px'});
  styles.updateRule('.weekview .week .day',{height: iH +'px'});
  styles.updateRule('.weekview .week ul.hoursbg',{height: iH +'px'});
  styles.updateRule('.weekview .week .day ul.eventlist',{height: iH +'px'});
  var startt = settings.start.getLongMinutes();
  var endt = settings.end.getLongMinutes();
  var oH = ( iH ) / ( (endt-startt) / 100 );  
  styles.updateRule ( '.hoursbg > li', {height: oH + 'px' });
  window.setTimeout(function(){$('#wcal').scrollTop($('#wcal').height()*oldTop);},300);
  resize_time = (new Date()).getTime() - started.getTime();
}

function calSettings (e)
{
  var ul = $('<ul class="settings" ></ul>');
  $(ul).append ('<li><span></span><span class="header">'+ui.settings+'</span></li>');
  var props  = {"start":"Day Starts","end":"Day Ends","twentyFour":"24 Hour Time",'update frequency':'update frequency','weekStart':'Week Starts on','usealarms':"use alarms",shortAllDay:"Collapse Events that span Multiple Days"} ;
  var ptypes = {'start':'time'      ,'end':'time'    ,'twentyFour':'bool'        ,'update frequency':'number'          ,'weekStart':'day','usealarms':'bool','shortAllDay':'bool'} ;
  for ( var i in props )
    $(ul).append ('<li><span class="label">'+ui[i]+'</span><span class="value data'+ptypes[i]+'" tabindex="0" contenteditable="true" >'+printValue(settings[i],ptypes[i])+'</span></li>');
  $('.value',ul).click(calFieldClick);
  $('#caldialog').empty();
  $('#caldialog').append(ul);
  draggable ( $('#caldialog') );
  $('#caldialog').show();
  $('#caldialog li span:contains(name) + span').focus();
  $('#caldialog').append('<div class="button done" tabindex="0" >'+ui.done+'</div>');
  $('.calpopup .done').bind ('click keypress',function (e) {
        if ( e.keyCode > 0 )
          if ( e.keyCode != 32 && e.keyCode != 13 )
            return ;
        if ( saveSettings(true) == true ) 
        {
          $('.calpopup').fadeOut();
          $('#wcal').removeData('popup'); 
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        }
      }
      );
  $('#wcal').data('popup','#caldialog');
  $('#wcal').data('clicked', e.target);
  $(document).click( $('#wcal').data('edit_click') ); 
  $(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function saveSettings (dialog)
{
  if ( dialog )
  {
    var props  = {"start":"Day Starts","end":"Day Ends","twentyFour":"24 Hour Time",'update frequency':'update frequency','weekStart':'Week Starts on','usealarms':"use alarms",shortAllDay:"Collapse Events that span Multiple Days"} ;
    var ptypes = {'start':'time'      ,'end':'time'    ,'twentyFour':'bool'        ,'update frequency':'number'          ,'weekStart':'day','usealarms':'bool','shortAllDay':'bool'} ;
    for ( var i in props )
    {
      settings[i] = getValue( $('#caldialog li span:contains('+ui[i]+') + span'), ptypes[i] );
    }
    styles.getStyleSheet ( 'calstyle' );
    if ( ! settings.shortAllDay )
    {
      styles.updateRule('.week .day ul.eventlist > li.multiday',{width: '100%'});
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+6),  .day ul.eventlist > li.multiday:nth-last-child(1n+6)  ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '50%'    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+11), .day ul.eventlist > li.multiday:nth-last-child(1n+11) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '33.34%' } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+16), .day ul.eventlist > li.multiday:nth-last-child(1n+16) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '25%'    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+21), .day ul.eventlist > li.multiday:nth-last-child(1n+21) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '20%'    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+26), .day ul.eventlist > li.multiday:nth-last-child(1n+26) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '16.7%'  } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+31), .day ul.eventlist > li.multiday:nth-last-child(1n+31) ~ li.multiday', { 'margin-bottom': '1px', 'line-height': '14.28%' } ); 
    }
    else
    {
      styles.updateRule('.week .day ul.eventlist > li.multiday',{width: null});

	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+6),  .day ul.eventlist > li.multiday:nth-last-child(1n+6)  ~ li.multiday', { 'margin-bottom': null, 'line-height': null    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+11), .day ul.eventlist > li.multiday:nth-last-child(1n+11) ~ li.multiday', { 'margin-bottom': null, 'line-height': null } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+16), .day ul.eventlist > li.multiday:nth-last-child(1n+16) ~ li.multiday', { 'margin-bottom': null, 'line-height': null    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+21), .day ul.eventlist > li.multiday:nth-last-child(1n+21) ~ li.multiday', { 'margin-bottom': null, 'line-height': null    } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+26), .day ul.eventlist > li.multiday:nth-last-child(1n+26) ~ li.multiday', { 'margin-bottom': null, 'line-height': null  } ); 
	    styles.updateRule('.day ul.eventlist > li.multiday:nth-last-child(1n+31), .day ul.eventlist > li.multiday:nth-last-child(1n+31) ~ li.multiday', { 'margin-bottom': null, 'line-height': null } ); 


    }
  }
  var s = $.extend(true,{},settings);
  s.start = s.start.DateString();
  s.end = s.end.DateString();
  var t = {0:{ns:"http://boxacle.net/ns/calendar/",name:'calendar-settings',value:JSON.stringify(s)}};
  var cals = $(document).caldav('calendars');
  var url = '';
  for ( var i in cals )
  {
    if ( cals[i].mailto.match(RegExp($('#name').val(),'i')) )
    {
      url = cals[i].principal;
      break ;
    }
  }
  $(document).caldav('updateCollection', {url:$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].calendar},$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].calendar,t);
  return true;
}

function printValue( val , type )
{
  switch ( type )
  {
    case 'bool':
      return val?ui['yes']:ui['no'];
    case 'text':
      return val;
    case 'number':
      return val;
    case 'day':
      return weekdays[val];
    case 'time':
      return  val.prettyTime();
    case 'date':
    case 'datetime':
      return  val.prettyDate();
  }
}

function getValue( ele , type )
{
  switch ( type )
  {
    case 'bool':
      return $(ele).text()==ui['yes'];
    case 'text':
      return $(ele).text();
    case 'number':
      return Number($(ele).text());
    case 'day':
      return weekdays.indexOf ($(ele).text());
    case 'time':
      return  Zero().parsePrettyTime($(ele).text()) ;
    case 'date':
    case 'datetime':
      return  (new Date()).parsePrettyDate($(ele).text());
  }
}

function colorClicked ( e )
{
  var t = '<div class="colorpicker" >';
  for ( var i = 1; i<=30; i++ )
    t = t + '<span class="color'+i+'"></span>';
  t = t + '</div>';
  var c = $(t);
  $('span',c).click(function(e){ 
    var color = RGBtoHex($(e.target).css('background-color'));
    $(e.target).closest('.value').text(color); 
    $(e.target).closest('.colorpicker').remove(); 
    return false; });
  $(e.target).blur(function (e){$(e.target).children('.colorpicker').remove();});
  $(e.target).append(c);
  var p = $(e.target).position ( );
  $(c).css({left:p.left+$(e.target).outerWidth()});
}

function calFieldClick(e)
{
  var cp = $($('#wcal').data('popup'));
  var label = $(e.target).prev().text();
  var props  = {'start':'Day Starts','end':'Day Ends','twentyFour':'24 Hour Time','update frequency':'update frequency','weekStart':'Week Starts on','usealarms':"use alarms"} ;
  var propOptions  = {'twentyFour':[ui['yes'],ui['no']],'usealarms':[ui['yes'],ui['no']]} ;
  propOptions.weekStart = weekdays;
  for ( var i in props )
    if ( ui[i] == label )
      break;
  if ( propOptions[i] != undefined && propOptions[i].length > 0 )
  {
    var options = propOptions[i];
    var currentValue = $(e.target).text();
    var txt = '<div class="completionWrapper"><div class="completion">';
    for ( var j = 0; j < options.length; j++ )
      txt = txt + '<div'+ (options[j]==currentValue?' class="selected" ':'') +'>'+options[j]+'</div>';
    txt = txt + '</div></div>';
    var comp = $(txt);
    $(comp).children().click(function(evt){$(evt.target).parent().parent().next().text($(evt.target).text());
      $(evt.target).parent().parent().fadeOut(function(){$(this).remove();});
      popupOverflowAuto();
      return false;
    });
    $(e.target).bind('keydown',function (e2){ 
      e2.spaceSelects = true; 
      e2.search = true; 
      e2.removeOnEscape = true; 
      var k = keyboardSelector(e2);
      if ( k == 'cancel' )
      {
        $('#wcal').data('eatCancel',true);
        $(this).unbind('blur');
        popupOverflowAuto();
        e2.stopPropagation();
        return false;
      }
      else if ( $(k).length == 1 )
      {
        $(this).unbind('blur');
        $(this).text($(k).text());
        $(this).prev().fadeOut(function(){$(this).remove();});
        popupOverflowAuto();
        var ret = e2.which==9;  
        return ret;
      } 
      else
        return k;
      },false);
    $(comp).css({top:$(e.target).position().top,left:$(e.target).position().left,'margin-left':'2em'});
    $(e.target).bind('blur',function(evt){$(evt.target).prev().fadeOut(function(){$(this).remove();});popupOverflowAuto();$(this).unbind(evt);});
    popupOverflowVisi();
    $(e.target).before(comp);
  }
}

function subscribeCalendar (e)
{
  var proxyurl = $('.jqcaldav').data('calproxyurl');
  if ( proxyurl == '' )
    return;
  var ul = $('<ul></ul>');
  var props ={'a':'name','b':'url','c':'color','d':'description','order':'order'} ;
  for ( var i in props )
    $(ul).append ('<li><span class="label">'+ui[props[i]]+'</span><span class="value" tabindex="0" contenteditable="true">'+(i=='a'?'New Calendar':'')+'</span></li>');
  $('#caldialog').empty();
  $('#caldialog').append(ul);
  draggable ( $('#caldialog') );
  $('#caldialog').show();
  $('#caldialog li span:contains('+ui.name+') + span').focus();
  $('#caldialog li span:contains('+ui.color+') + span').click ( colorClicked );
  $('#caldialog').append('<div class="button done" tabindex="0" >'+ui.done+'</div>');
  $('.calpopup .done').bind ('click keypress',function (e) {
        if ( e.keyCode > 0 )
          if ( e.keyCode != 32 && e.keyCode != 13 )
            return ;
        if ( saveSubscription() == true ) 
        {
          $('.calpopup').fadeOut();
          $('#wcal').removeData('popup'); 
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        }
      }
      );
  $('#wcal').data('popup','#caldialog');
  $('#wcal').data('clicked', e.target);
  $(document).click( $('#wcal').data('edit_click') ); 
  $(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function saveSubscription ()
{
  var cal = $('#caldialog ul').data('calendar');
  var name = $('#caldialog li span:contains('+ui.name+') + span').text();
  var url = $('#caldialog li span:contains('+ui.url+') + span').text();
  var color = $('#caldialog li span:contains('+ui.color+') + span').text();
  var order = $('#caldialog li span:contains('+ui.order+') + span').text();
  var description = $('#caldialog li span:contains('+ui.description+') + span').text();
  if ( cal != undefined )
  {
    var cals = $('#wcal').data('subscribed');
    for ( var j in subscriptions )
      if ( subscriptions[j].url == cals[cal].url && ( subscriptions[j].name == cals[cal].name || subscriptions[j].name == cals[cal].displayName ) )
        subscriptions[j] = {name:name,url:url,'color':color,'order':order,'description':description};
  }
  else if ( subscriptions == undefined || ! subscriptions instanceof Object )
    subscriptions = [{name:name,url:url,'color':color,'order':order,'description':description}];
  else
    subscriptions.push({name:name,url:url,'color':color,'order':order,'description':description});
  var purl = '';
  var cals = $(document).caldav('calendars');
  for ( var j in cals )
  {
    if ( cals[j].mailto.match(RegExp($('#name').val(),'i')) )
    {
      purl = cals[j].principal;
      break ;
    }
  }
  var t = {0:{ns:"http://boxacle.net/ns/calendar/",name:'calendar-subscriptions',value:JSON.stringify(subscriptions)}};
  $(document).caldav('updateCollection', {url:purl},purl,t);
  if ( cal == undefined )
    fetchCalendar (url,name,color,order,description);
  else
  {
    var ss = styles.getStyleSheet ( 'calstyle' );
    ss.updateRule ( '.calendar'+cal ,{ color: color }  );
    ss.updateRule ( '.calendar'+cal +':hover',{ 'background-color': color } );
    ss.updateRule ( '.calendar'+cal +'bg',{ 'background-color': color } );
    $('#callist .calendar' + cal).attr('order',order);
    $('#callist .calendar' + cal).attr('title',description);
    $('#callist .calendar' + cal + ' span').text(name);
    eventSort($('#callist .calendar' + cal).parent());
  }
  return true;
}

function addSubscribedCalendar(name,color,order,description,url,i)
{
  var proxyurl = $('.jqcaldav').data('calproxyurl');
  if ( proxyurl == '' )
    return;
  var cparent = $('#callist li:contains(Subscribed) > ul');
  var ss = styles.getStyleSheet ( 'calstyle' );
  ss.updateRule ( '.calendar'+i ,{ color: color }  );
  ss.updateRule ( '.calendar'+i +':hover',{ 'background-color': color } );
  ss.updateRule ( '.calendar'+i +'bg',{ 'background-color': color } ); 
  if ( ! cparent.length )
  {
    $('<li class="open"  ><span>'+ui.subscribed+'</span><ul data-mailto="Subscribed" ></ul></li>').appendTo('#callist');
    var cparent = $('#callist li:contains('+ui.subscribed+') > ul');
    $('#callist li:contains('+ui.subscribed+') > span').click (function (){$('li.selected',$(this).parent()).toggleClass('selected');$(this).parent('li').toggleClass('open');$(this).parent('li').toggleClass('closed');});
  }
  var ce = $('<li class="calendar'+i+'" order="'+order+'" title="'+description+'"><input type="checkbox" id="calendar'+i+'" checked="true" /><span >'+name+'</span></li>');
  $(ce).dblclick (editCalendar);
  $('input',ce).change(toggleCalendar);
  $(cparent).append(ce);
  eventSort(cparent);
  if ( settings.calendars != undefined && settings.calendars[url] != undefined && settings.calendars[url] == false )
  {
    $('input',ce).attr('checked',false);
    var ss = styles.getStyleSheet ( 'calstyle' );
    ss.updateRule ( '#wcal .day .event.calendar'+i ,{ opacity: 0 }  );
    ss.updateRule ( '#wcal .day .event.calendar'+i +'bg',{ opacity: 0 } );
    ss.updateRule ( '#wcal .day .event.calendar'+i ,{ display: 'none' }  );
    ss.updateRule ( '#wcal .day .event.calendar'+i +'bg',{ display:'none' } );
  }
  return i;
}

function fetchCalendar ( curl, name, color, order, description )
{
  var proxyurl = $('.jqcaldav').data('calproxyurl');
  if ( proxyurl == '' )
    return;

  var cals = $(document).caldav('calendars');
  var scals = $('#wcal').data('subscribed');
  if ( typeof scals != "object" ) {scals = []; scals[cals.length]={};}
  var i = null;
  var j;
  for ( j in scals )
    if ( scals[j].url == curl && scals[j].name == name )
      i = j;
  if ( i == null )
  {
    i = Number(j) + 1 ;
  }
  var cal = i;
  if ( typeof scals != "object" ) scals = {};
    scals[cal]={    
      src: curl,
      order: order,
      displayName: name,
      desc: description,
      color: color,
      url: curl};
  $('#wcal').data('subscribed',scals); 

  $.get($('.jqcaldav').data('calproxyurl')+curl).complete(function (req) {
    var data = req.responseText;
    addSubscribedCalendar(name,color,order,description,curl,i);
    var scals = $('#wcal').data('subscribed');
    scals[cal]['events'] = new iCal ( data );
    if ( debug ) console.log(scals[cal].events.length );
    $('#wcal').data('subscribed',scals); 
    addSubscribedEvents(cal, $('#wcal').data('firstweek'),$('#wcal').data('lastweek'));
  });
}

function addCalendar (e)
{
  var ul = $('<ul data-calendar="new" ></ul>');
  var props ={'a':'name','b':'color','c':'description','e':'order','d':'owner'} ;
  var cals = $(document).caldav('calendars');
  var c = $('#callist li.selected'); 
  if ( c.length > 0 )
    c = $(c).attr('class').match(/calendar(\d+)/)[1];
  else
    c = 0;
  for ( var i in props )
    $(ul).append ('<li><span class="label">'+ui[props[i]]+'</span><span class="value" tabindex="0" contenteditable="true">'+(i=='a'?ui['new calendar']:'')+'</span></li>');
  $('span:contains('+ui.owner+') ~ .value',ul).attr('data-principal',cals[c].principal);
  $('span:contains('+ui.color+') ~ .value',ul).text( randomColor() );
  $('span:contains('+ui.color+') ~ .value',ul).click( colorClicked );
  $('span:contains('+ui.owner+') ~ .value',ul).text(cals[c].principalName);
  $('span:contains('+ui.owner+') ~ span',ul).keydown(completePrincipal);
  $('span:contains('+ui.owner+') ~ span',ul).before('<div class="completionWrapper"><div class="completion"></div></div>');
  var li = $('<li><span class="label">'+ui.privileges+'</span></li>'); 
  $(li).append ( '<div class="completionWrapper"><div class="completion"></div></div><span class="value" data-principal="new principal" contenteditable="true">'+ui.add+'</span>' );
  $('span:[data-principal="new principal"]',li).focus(function(e){if ($(this).text()==ui.add)$(this).text('');});
  $('span:[data-principal="new principal"]',li).blur(function(e)
    {
      if ($(this).text()=='')$(this).text(ui.add);
      if ( $(this).attr('data-principal').length > 1 && $(this).attr('data-principal') != "new principal" )
      {
        $(this).prev().before(privilegeBox($('<ace><principal><href>'+$(this).attr('data-principal')+'</href></principal></ace>')));
        $(this).attr('data-principal','new principal');
        $(this).removeData('principal');
        $(this).text(ui.add);
      }
    });
  $('span:[data-principal="new principal"]',li).keydown(completePrincipal);
  $(ul).append ( li );
  $('#caldialog').empty();
  $('#caldialog').append(ul);
  draggable ( $('#caldialog') );
  $('#caldialog').show();
  $('#caldialog li span:contains('+ui.name+') + span').focus();
  $('#caldialog').append('<div class="button done" tabindex="0" >'+ui.done+'</div>');
  $('.calpopup .done').bind ('click keypress',function (e) {
        if ( e.keyCode > 0 )
          if ( e.keyCode != 32 && e.keyCode != 13 )
            return ;
        if ( saveCalendar() == true ) 
        {
          $('.calpopup').fadeOut();
          $('#wcal').removeData('popup'); 
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        }
      }
      );
  $('#wcal').data('popup','#caldialog');
  $('#wcal').data('clicked', e.target);
  $(document).click( $('#wcal').data('edit_click') ); 
  $(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function selectCalendar (e)
{
  var c = $('#callist li.selected'); 
  $(c).removeClass('selected');
  var c = $(this);
  $(c).addClass('selected');
  var cals = $(document).caldav('calendars');
  var cal = $(c).attr('class').match(/calendar(\d+)/)[1];
  if ( ! cals[cal] )
  {
    cals = $('#wcal').data('subscribed');
    settings['selectedCalendar'] = cals[cal].src; 
  }
  else
    settings['selectedCalendar'] = cals[cal].href; 
  saveSettings(false);
}

function toggleCalendar ()
{
  var ss = styles.getStyleSheet ( 'calstyle' );
  var i = this.id;
  if ( ! this.checked ) 
  {
    ss.updateRule ( '#caltodo .event.'+i ,{ display: 'none' }  );
    ss.updateRule ( '#wcal .day .event.'+i ,{ opacity: 0, height: 0 }  );
    ss.updateRule ( '#wcal .day .event.'+i +'bg',{ opacity: 0, height: 0 } );
    window.setTimeout(function(){
        ss.updateRule ( '#wcal .day .event.'+i ,{ display: 'none' }  );
        ss.updateRule ( '#wcal .day .event.'+i +'bg',{ display:'none' } );
        $('.'+i).attr('lang','x-klingon');
      },250);
  }
  else 
  {
    ss.updateRule ( '#caltodo .event.'+i ,{ display: null }  );
    ss.updateRule ( '#wcal .day .event.'+i ,{ display: null }  );
    ss.updateRule ( '#wcal .day .event.'+i +'bg',{ display: null } );
    window.setTimeout(function(){
        ss.updateRule ( '#wcal .day .event.'+i ,{ opacity: 1, height: null }  );
        ss.updateRule ( '#wcal .day .event.'+i +'bg',{ opacity: 1, height: null } );
        $('.'+i).removeAttr('lang');
      },100);
  }
  var cals = $(document).caldav('calendars');
  var scals = $('#wcal').data('subscribed');
  if ( settings['calendars'] == undefined )
    settings['calendars'] = {};
  $.each($('#callist input'),function (i,v)
  {
    var num = $(v).attr('id').match(/(\d+)/)[1];
    if ( cals[num] )
      settings['calendars'][cals[num].url] = this.checked?'true':'false';
    else
      settings['calendars'][scals[num].url] = this.checked?'true':'false';
  });
  saveSettings(false);
}

function editCalendar (e)
{
  var c = $(e.target).parents('li').attr('class').match(/calendar(\d+)/)[1];
  var ul = $('<ul data-calendar="' + c + '" ></ul>');
  var props ={'displayName':'name','color':'color','order':'order','desc':'description'} ;
  var cals = $(document).caldav('calendars');
  var noprivs = false;
  if ( cals[c] == undefined )
  {
    cals = $('#wcal').data('subscribed');
    props.url='url';
    noprivs = true;
  }
  for ( var i in props )
    $(ul).append ('<li><span class="label">'+ui[props[i]]+'</span><span class="value" data-prop="' + props[i] + 
        '" data-value="' + cals[c][i] + '" contenteditable="true">'+ cals[c][i] +'</span></li>');
  if ( ! noprivs && ( cals[c].perms['read'] || cals[c].perms['read-acl'] ) )
  {
    var write = false;
    if ( cals[c].perms['write'] || cals[c].perms['write-acl'] )
      write = true;
    var acl = $('acl > ace:has(href)',cals[c].xml);
    var supported_acl = $('supported-privilege-set',cals[c].xml);
    var li = $('<li><span class="label" privileges="true" >'+ui.privileges+'</span></li>'); 
    $(li).hover(function(){$($('#wcal').data('popup')).css({overflow:'visible'});},function(){$($('#wcal').data('popup')).css({overflow:'auto'});});
    for (i=0;i<acl.length;i++)
    {
      $(li).append (  privilegeBox( acl[i], supported_acl , write ) );
    }
    $(li).append ( '<div class="completionWrapper"><div class="completion"></div></div><span class="value" data-principal="new principal" contenteditable="true">'+ui.add+'</span>' );
    $('span:[data-principal="new principal"]',li).focus(function(e){$($('#wcal').data('popup')).css({overflow:'visible'});if ($(this).text()==ui.add)$(this).text('');});
    $('span:[data-principal="new principal"]',li).blur(function(e)
      {
        $($('#wcal').data('popup')).css({overflow:'auto'});
        if ($(this).text()=='')$(this).text(ui.add);
        if ( $(this).attr('data-principal').length > 1 && $(this).attr('data-principal') != "new principal" )
        {
          $(this).prev().before(privilegeBox($('<ace><principal><href>'+$(this).attr('data-principal')+'</href></principal></ace>'),supported_acl,true));
          $(this).attr('data-principal','new principal');
          $(this).removeData('principal');
          $(this).text(ui.add);
        }
      });
    $('span:[data-principal="new principal"]',li).keydown(completePrincipal);
    $(ul).append ( li );
  }
  $('#caldialog').empty();
  $('#caldialog').css({overflow:'auto'});
  $('[data-prop=color]',ul).click ( colorClicked );
  $('#caldialog').append(ul);
  $('#caldialog').data('url', cals[c].href);
  draggable ( $('#caldialog') );
  $('#caldialog').show();
  $('#caldialog li span:contains(name) + span').focus();
  if ( /bind/.test ( $.fn.caldav.serverSupports ) )
    $('#caldialog').append('<div class="button bind" tabindex="0">'+ui['bind']+'</div>');
  //else
  //  $('#caldialog').append('<div class="button unbind" tabindex="0">'+ui['unbind']+'</div>');
  $('#caldialog').append('<div class="button delete" tabindex="0">'+ui['delete']+'</div>');
  $('#caldialog').append('<div class="button done" tabindex="0" >'+ui.done+'</div>');
  $('#caldialog .button').bind ('click keypress',function (e) {
        if ( e.keyCode > 0 )
          if ( e.keyCode != 32 || e.keyCode != 13 )
            return ;
        if ( noprivs && $(this).hasClass('done') && saveSubscription() == true )  
        {
          $(e.target).closest('.calpopup').fadeOut();
          $('#wcal').removeData('popup'); 
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        }
        else if ( $(this).hasClass('done') && saveCalendar() == true )   
        {
          $(e.target).closest('.calpopup').fadeOut();
          $('#wcal').removeData('popup'); 
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        }
        else if ( $(this).hasClass('delete') && delCalendar() == true ) 
        {
          $(e.target).closest('.calpopup').fadeOut();
          $('#wcal').removeData('popup'); 
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        }
        else if ( $(this).hasClass('unbind')  ) 
        {
          var href = cals[c].href;
          href = href.replace (/\/$/,'');
          var seg = href.match ( /\/([^\/]+)$/ )[1] +'';
          href = href.replace (/\/[^\/]*$/,'');
          if ( debug )
            console.log( seg, href );
          $(document).caldav('unbind', seg, href );
          $(e.target).closest('.calpopup').fadeOut();
          $('#wcal').removeData('popup'); 
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        }
        else if ( $(this).hasClass('bind')  ) 
        {
          $('#caldialog').fadeOut('fast');
          bind ( c );
          return false;
        }
      }
      );
  $('#wcal').data('popup','#caldialog');
  $('#wcal').data('clicked', e.target);
  $(document).click( $('#wcal').data('edit_click') ); 
  $(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function bind ( c )
{
  var cals = $(document).caldav('calendars');
  $('#caldialog').empty();
  var ul = $('<ul data-calendar="' + c + '" ></ul>');
  var props = {"name":"name","user":"user","source":"source"};
  for ( var i in props )
    $(ul).append ('<li><span class="label">'+ui[props[i]]+'</span><span class="value ' + props[i] + '" data-prop="' + props[i] + 
        '" contenteditable="true">'+ i +'</span></li>');
  $('#caldialog').append(ul);
  $('#caldialog span.user').data('principal',$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].href);
  $('#caldialog span.user').text($.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name);
  $('#caldialog span.user').before('<div class="completionWrapper"><div class="completion"></div></div>');
  $('#caldialog span.user').keydown(completePrincipal);
  $('#caldialog').css({overflow:'auto'});
  $('#caldialog').append('<div class="button done" tabindex="0">'+ui['done']+'</div>');
  if ( (0+c) > -1 )
  {
    $('#caldialog span.name').text(cals[c].displayName);
    $('#caldialog span.source').text(cals[c].href);
  }
  $(this).unbind('click keypress');
  $('#caldialog .button').bind ('click keypress',function (e) {
      if ( $(this).hasClass('done') )
      {
        var name = $('#caldialog span.name').text();
        var path = $('#caldialog span.user').data('principal');
        var source = $('#caldialog span.source').text();
        if ( debug )
          console.log('bind', name, path , source );
        $(document).caldav('bind', name, path , source );
        $(e.target).closest('.calpopup').fadeOut();
        $('#wcal').removeData('popup'); 
        $(document).unbind('click',$('#wcal').data('edit_click')); 
        $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
      }
      return false;
    });
  $('#caldialog').fadeIn();
}

function privilegeBox ( acl, supported, write )
{
  if ( write !== true )
    write = false
  var privd = {
    all:['bind','unbind','unlock'],
    read:['acl','free-busy','privileges'],
    write:['content','properties','acl'],
    'schedule-send':['invite','reply','freebusy'],
    'schedule-deliver':['invite','reply','query-freebusy']};
  var who = $('<span class="value privilegeOwner" data-principal="'+ $('principal',acl).text().trim() + '" >'+ $('principal',acl).text().trim() + '</span>' );

  $(document).caldav ('getProperties',{url: $('principal',acl).text().trim() },{'displayname':'DAV:'},
      function (a)
      {
        var matches = new Array;
        var text='';
        var m = $('response',a);
        var url = $('href:first',m).text().trim();
        var newtext = $('.privilegeOwner[data-principal="'+url+'"]')[0];
        newtext.childNodes[0].textContent = $('displayname',m).text().trim();
      });

  var box = $('<ul class="privilegeBox"></ul>');
  var desc = '';
  for ( var i in privd )
  {
    var hasPriv = $('grant ' + i ,acl).length>0?'granted':'';
    var granted = $('grant ' + i ,acl).length>0?'yes':'no';
    if ( supported )
    {
      var desc = $('supported-privilege > privilege > ' + i,supported);
      if ( desc.length == 0 )
        continue;
      var desc = $(desc).parent().siblings('description').text();
    }
    var li = $( '<li class="'+hasPriv+'" title="'+desc+'" data-granted="'+granted+'" data-priv="'+i+'">'+i+'</li>');
    var line = $( '<ul></ul>');
    for ( var j=0;j<privd[i].length;j++)
    {
      var p = i=='all'?privd[i][j]:i+'-'+privd[i][j];
      if (p=='schedule-deliver-query-freebusy')
        p = 'schedule-query-freebusy';
      var hasPriv = $('grant ' + p ,acl).length>0?'granted':'';
      var granted = $('grant ' + p ,acl).length>0?'yes':'no';
      if ( supported )
      {
        var desc = $('supported-privilege > privilege > ' + p,supported);
        if ( desc.length == 0 )
          continue;
        var desc = $(desc).parent().siblings('description').text();
      }
      $(line).append('<li class="'+hasPriv+'" title="'+desc+'" data-granted="'+granted+'" data-priv="'+p+'">' + privileges[privd[i][j]] + '</li>' );
    }
    $(li).append(line);
    $(box).append(li);
  }
  if ( write )
    $('li',box).click(function (){$(this).toggleClass('granted');return false});
  $(who).append(box);
  return who;
}

function saveCalendar (e)
{
  var cd = $('#caldialog');
  var cal = $('#caldialog ul').data('calendar');
  var cals = $(document).caldav('calendars');
  if ( cals[cal] )
    var acl = $('acl',cals[cal].xml).clone();
  else
    var acl = [];
  var props ={'displayname':'name','calendar-color':'color','calendar-description':'description','calendar-order':'order'} ;
  var ns ={'displayname':'DAV:','calendar-color':'http://apple.com/ns/ical/','calendar-description':'urn:ietf:params:xml:ns:caldav','calendar-order':'http://apple.com/ns/ical/'} ;
  var edited = false;
  var modified = {};
  for ( var i in props ) 
  {
    var v = $('.label:contains('+ ui[props[i]] +') ~ .value',cd); 
    if ( $(v).length > 0 && $(v).text() != $(v).data('value') )
    {
      modified[i] = {name:i,value:$(v).text(),ns:ns[i]};
      edited = true;
    }
  }
  if ( cals[cal] && ( cals[cal].all || cals[cal].perms.write || cals[cal].perms['write-acl'] ) )
  {
    var privd = ['all','bind','unbind','unlock','read','read-acl','read-free-busy','read-privileges','write','write-content','write-properties','write-acl','schedule-send','schedule-send-invite','schedule-send-reply','schedule-send-freebusy','schedule-deliver','schedule-deliver-invite','schedule-deliver-reply','schedule-query-freebusy'];
    
    var principals = $('.label:contains('+ ui.privileges +') ~ .privilegeOwner',cd);
    for ( var p=0; p<principals.length; p++)
    {
      var owner = $(principals[p]).data('principal');
      var ace = $('ace',acl).filter(function(){if ($('principal > href ',this).text() == owner) return true;});
      var addACE = false;
      if ( ace.length == 0 )
      {
        addACE = true;
        var ace = document.createElementNS('DAV:','ace');
        var princpl = document.createElementNS('DAV:','principal');
        ace.appendChild(princpl);
        var href = document.createElementNS('DAV:','href');
        href.appendChild(document.createTextNode(owner));
        princpl.appendChild(href);
        var grant = document.createElementNS('DAV:','grant');
        ace.appendChild(grant);
      }
      else
        var grant = $('grant',ace)[0];
      var privs = [];
      var mod = false;
      for ( var j in privd )
      {
        var cp = $('li[data-priv="'+privd[j] +'"]',principals[p]);
        var g = $(cp).hasClass('granted');
        var pg = $(cp).data('granted');
        if ( g )
          privs.push(privd[j]);
        if ( ( g && pg == 'no' ) || ( ! g && pg == 'yes' ) )
          mod = true;
        if ( g && pg == 'no' ) 
        {
          var privilege = document.createElementNS('DAV:','privilege');
          var pname = document.createElementNS('DAV:',privd[j]);
          privilege.appendChild(pname);
          grant.appendChild(privilege);
        }
        if ( ! g && pg == 'yes' )
        {
          var cpriv = $('grant > privilege > ' + privd[j] ,ace);
          if ( cpriv.length == 0 )
            continue;
          if ( $(cpriv).siblings().length == 0 )
            $(cpriv).parent().remove();
          else
            $(cpriv).remove();
        }
      }
      if ( mod )
      {
        if ( addACE )
          $(acl).append(ace);
        console.log('privileges changed for ' + owner);
      }
    }
    $('ace inherited',acl).closest('ace').remove();
    $('ace protected',acl).closest('ace').remove();
    var s = new XMLSerializer();
    var newacl = '<?xml version="1.0" encoding="utf-8"?>' + "\n" + s.serializeToString(acl[0]);
    if ( debug )
      console.log(newacl);
  }
  if ( cal == 'new' )
  {
    var v = $('.label:contains('+ ui.owner +') ~ .value',cd); 
    var owner = $(v).data('principal');
    var ownerName = $(v).text();
    var cals = $(document).caldav('calendars');
    var url = $.fn.caldav.principals[$.fn.caldav.principalMap[owner]].calendarHome ;
    if ( url.length < 3 )
      var url = owner;
    url = url + guid() + '/' ;
    var p = $('#callist > li > span:contains('+ownerName+')').next();
    var i = cals.length;

    var color = modified['calendar-color'].value;
    console.log( 'color ' + color );
    var ss = styles.getStyleSheet ( 'calstyle' );
    ss.updateRule ( '.calendar'+i ,{ color: color }  );
    ss.updateRule ( '.calendar'+i +':hover',{ 'background-color': color } );
    ss.updateRule ( '.calendar'+i +'bg',{ 'background-color': color } );
    
    cals[i] = {};
    cals[i].order = modified['calendar-order'].value;
    cals[i].displayName = modified['displayname'].value;
    cals[i].desc = modified['calendar-description'].value;
    cals[i].href = url + '/';
    cals[i].url = $('.jqcaldav:first').data('caldavurl').replace(/([a-z])\/.*$/,'$1') +  url + '/'; 
    var ce = $('<li class="calendar'+i+'" order="'+cals[i].order+'" title="'+cals[i].desc+'"><input type="checkbox" id="calendar'+i+'" checked="true" /><span >'+cals[i].displayName+'</span></li>');
    $(ce)[0].addEventListener('drop',calDrop,true);
    $(ce)[0].addEventListener('dragenter', calDragEnter,true);
    $(ce)[0].addEventListener('dragover', calDragOver,true);
    $(ce).click (selectCalendar);
    $(ce).dblclick (editCalendar);
    $(ce).data(cals[i]);
    $(p).append(ce);
    eventSort(p);
  }
  else
  {
    if ( cals[cal].perms.all || cals[cal].perms.write || cals[cal].perms['write-acl'] )
      $.acl({url:cals[cal].href,username:$.fn.caldav.options.username,password:$.fn.caldav.options.password,data:newacl,
        complete:function(r,s){
          if (s!='success')
            alert('error setting privileges');
            else
            {
              var na = $(newacl);
              $('acl',$.fn.caldav.calendarData[cal].xml).replaceWith(na);
            }
        }});
    if ( modified['calendar-color'] != undefined )
    {
      var color = modified['calendar-color'].value;
      $.fn.caldav.calendarData[cal].color = color;
      var ss = styles.getStyleSheet ( 'calstyle' );
      ss.updateRule ( '.calendar'+cal ,{ color: color }  );
      ss.updateRule ( '.calendar'+cal +':hover',{ 'background-color': color } );
      ss.updateRule ( '.calendar'+cal +'bg',{ 'background-color': color } );
    }
    if ( modified['calendar-order'] != undefined )
    {
      $('#callist .calendar' + cal).attr('order',modified['calendar-order'].value);
      $.fn.caldav.calendarData[cal].order = modified['calendar-order'].value;
      eventSort( $('#callist .calendar' + cal).parent() );
    }
    if ( modified['calendar-description'] != undefined )
    {
      $('#callist .calendar' + cal).attr('title',modified['calendar-description'].value);
      $.fn.caldav.calendarData[cal].desc = modified['calendar-description'].value;
    }
  }
  if ( edited )
  {
    console.log(modified); 
    if ( cal == 'new' )
      $(document).caldav('makeCalendar', {url:url},cal,modified);
    else
      $(document).caldav('updateCollection', {},cal,modified);
  }
  return true;
}

function delCalendar (e)
{
  var calendar = $('#caldialog > ul').data('calendar');
  var noprivs = false;
  var cals = $(document).caldav('calendars');
  if ( cals[calendar] == undefined )
  {
    cals = $('#wcal').data('subscribed');
    noprivs = true;
  }
  $('#wcal').data('drop-question',calendar);
  questionBox(deleteCalQuestion[0] + cals[calendar].displayName ,deleteCalQuestion[1],
          function(e) {
            var calendar = $('#wcal').data('drop-question');
            $('#wcal').removeData('drop-question');
            if ( e == 1 )
            {
              var cals = $(document).caldav('calendars');
              if ( cals[calendar] == undefined )
              {
                var cals = $('#wcal').data('subscribed');
                $('.calendar' + calendar).remove();
                for ( var j in subscriptions )
                  if ( subscriptions[j] != undefined && subscriptions[j].url == cals[calendar].url && subscriptions[j].name == cals[calendar].displayName )
                    delete subscriptions[j];
                delete cals[calendar];
                $('#wcal').data('subscribed',cals);
                var purl = '';
                var cals = $(document).caldav('calendars');
                for ( var j in cals )
                {
                  if ( cals[j].mailto.match(RegExp($('#name').val(),'i')) )
                  {
                    purl = cals[j].principal;
                    break ;
                  }
                }
                var t = {0:{ns:"http://boxacle.net/ns/calendar/",name:'calendar-subscriptions',value:JSON.stringify(subscriptions)}};
                $(document).caldav('updateCollection', {url:purl},purl,t);
              }
              else
                $(document).caldav('delCalendar', calendar); 
            }
            return ;
          } );
  return true;
}

function deletedCalendar (c, r,s)
{
  if ( s == 'success' );
    $('.calendar' + c ).remove();
}

function editPrincipal (e)
{
  var ul = $('<ul data-calendar="' + e.href + '" ></ul>');
  $(ul).data('c',e.cal);
  var props ={'name':'name','desc':'description'} ;
  var cals = $.fn.caldav.collectionData;
  var noprivs = false;
  if ( cals[e.cal] == undefined || ! cals[e.cal].perms['read-acl'] )
    noprivs = true;
  else
    var c = e.cal;
  for ( var i in props )
    $(ul).append ('<li><span class="label">'+ui[props[i]]+'</span><span class="value" data-prop="' + props[i] + 
        '" data-value="' + (e[i]?e[i]:'') + '" contenteditable="true">'+ (e[i]?e[i]:'') +'</span></li>');
  if ( ! noprivs )
  {
    var write = false;
    if ( cals[c].perms['all'] || cals[c].perms['write'] || cals[c].perms['write-acl'] )
      write = true
    var acl = $('acl > ace:has(href)',cals[c].xml);
    var supported_acl = $('supported-privilege-set',cals[c].xml);
    var li = $('<li><span class="label" privileges="true" >'+ui.privileges+'</span></li>'); 
    $(li).hover(function(){$($('#wcal').data('popup')).css({overflow:'visible'});},function(){$($('#wcal').data('popup')).css({overflow:'auto'});});
    for (i=0;i<acl.length;i++)
    {
      $(li).append (  privilegeBox(acl[i],supported_acl,write)  );
    }
    if ( write )
      $(li).append ( '<div class="completionWrapper"><div class="completion"></div></div><span class="value" data-principal="new principal" contenteditable="true">'+ui.add+'</span>' );
    $('span:[data-principal="new principal"]',li).focus(function(e){$($('#wcal').data('popup')).css({overflow:'visible'});if ($(this).text()==ui.add)$(this).text('');});
    $('span:[data-principal="new principal"]',li).blur(function(e)
      {
        $($('#wcal').data('popup')).css({overflow:'auto'});
        if ($(this).text()=='')$(this).text(ui.add);
        if ( $(this).attr('data-principal').length > 1 && $(this).attr('data-principal') != "new principal" )
        {
          var default_acl = $('ace:has(authenticated)',cals[c].xml);
          $(this).prev().before(privilegeBox($('<ace><principal><href>'+$(this).data('principal')+'</href></principal></ace>'),supported_acl,true));
          $(this).attr('data-principal','new principal');
          $(this).removeData('principal');
          $(this).text(ui.add);
        }
      });
    $('span:[data-principal="new principal"]',li).keydown(completePrincipal);
    $(ul).append ( li );
  }
  $('#caldialog').empty();
  $('#caldialog').css({overflow:'auto'});
  $('[data-prop=color]',ul).click ( colorClicked );
  $('#caldialog').append(ul);
  draggable ( $('#caldialog') );
  $('#caldialog').show();
  $('#caldialog li span:contains(name) + span').focus();
  $('#caldialog').append('<div class="button delete" tabindex="0">'+ui['delete']+'</div>');
  $('#caldialog').append('<div class="button done" tabindex="0" >'+ui.done+'</div>');
  $('#caldialog .button').bind ('click keypress',function (e) {
        if ( e.keyCode > 0 )
          if ( e.keyCode != 32 || e.keyCode != 13 )
            return ;
        if ( $(this).hasClass('done') && savePrincipal() == true )   
        {
          $(e.target).closest('.calpopup').fadeOut();
          $('#wcal').removeData('popup'); 
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        }
        if ( $(this).hasClass('delete') && delCalendar() == true ) 
        {
          $(e.target).closest('.calpopup').fadeOut();
          $('#wcal').removeData('popup'); 
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        }
      }
      );
  $('#wcal').data('popup','#caldialog');
  $('#wcal').data('clicked', e.target);
  $(document).click( $('#wcal').data('edit_click') ); 
  $(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function savePrincipal (e)
{
  var cd = $('#caldialog');
  var cal = $('#caldialog ul').data('calendar');
  var c = $('#caldialog ul').data('c');
  var cals = $.fn.caldav.collectionData;
  var props ={'displayname':'name','calendar-description':'description'} ;
  var ns ={'displayname':'DAV:','calendar-color':'http://apple.com/ns/ical/','calendar-description':'urn:ietf:params:xml:ns:caldav','calendar-order':'http://apple.com/ns/ical/'} ;
  var edited = false;
  var acledited = false;
  var write = false;
  var modified = {};
  if ( cals[c] )
    var acl = $('acl',cals[c].xml).clone();
  else
    var acl = [];
  for ( var i in props ) 
  {
    var v = $('.label:contains('+ ui[props[i]] +') ~ .value',cd); 
    if ( $(v).length > 0 && $(v).text() != $(v).data('value') )
    {
      modified[i] = {name:i,value:$(v).text(),ns:ns[i]};
      edited = true;
    }
  }
  if ( cals[c].perms['all'] || cals[c].perms['write'] || cals[c].perms['write-acl'] )
  {
    write = true;
    var privd = ['all','bind','unbind','unlock','read','read-acl','read-free-busy','read-privileges','write','write-content','write-properties','write-acl','schedule-send','schedule-send-invite','schedule-send-reply','schedule-send-freebusy','schedule-deliver','schedule-deliver-invite','schedule-deliver-reply','schedule-query-freebusy'];
    
    var principals = $('.label:contains('+ ui.privileges +') ~ .privilegeOwner',cd);
    for ( var p=0; p<principals.length; p++)
    {
      var owner = $(principals[p]).data('principal');
      var ace = $('ace',acl).filter(function(){if ($('principal > href ',this).text() == owner) return true;});
      var addACE = false;
      if ( ace.length == 0 )
      {
        addACE = true;
        var ace = document.createElementNS('DAV:','ace');
        var princpl = document.createElementNS('DAV:','principal');
        ace.appendChild(princpl);
        var href = document.createElementNS('DAV:','href');
        href.appendChild(document.createTextNode(owner));
        princpl.appendChild(href);
        var grant = document.createElementNS('DAV:','grant');
        ace.appendChild(grant);
      }
      else
        var grant = $('grant',ace)[0];
      var privs = [];
      var mod = false;
      for ( var j in privd )
      {
        var cp = $('li[data-priv="'+privd[j] +'"]',principals[p]);
        var g = $(cp).hasClass('granted');
        var pg = $(cp).data('granted');
        if ( g )
          privs.push(privd[j]);
        if ( ( g && pg == 'no' ) || ( ! g && pg == 'yes' ) )
          mod = true;
        if ( g && pg == 'no' ) 
        {
          var privilege = document.createElementNS('DAV:','privilege');
          var pname = document.createElementNS('DAV:',privd[j]);
          privilege.appendChild(pname);
          grant.appendChild(privilege);
        }
        if ( ! g && pg == 'yes' )
        {
          var cpriv = $('grant > privilege > ' + privd[j] ,ace);
          if ( cpriv.length == 0 )
            continue;
          if ( $(cpriv).siblings().length == 0 )
            $(cpriv).parent().remove();
          else
            $(cpriv).remove();
          if ( $('grant',ace).children().length == 0 )
            $(ace).remove();
        }
      }
      if ( mod )
      {
        acledited = true;
        if ( addACE )
          $(acl).append(ace);
        console.log('privileges changed for ' + owner);
        edited = true;
      }
    }
    $('ace inherited',acl).closest('ace').remove();
    $('ace protected',acl).closest('ace').remove();
    //var elements = acl[0].getElementsByTagName('*');
    //for ( var e=0; e < elements.length; e++ )
     // if ( elements[e].nodeType != 1 )
     //   elements[e].parentNode.removeChild(elements[e]);
    $('privilege > *',acl).empty();
    $('owner,authenticated,unauthenticated',acl).empty();
    console.log ( acl )
    var s = new XMLSerializer();
    var newacl = '<?xml version="1.0" encoding="utf-8"?>' + "\n" + XML(s.serializeToString(acl[0])).toXMLString();
    if ( debug )
      console.log(newacl);
  }
  if ( cal == 'new' )
  {
    var v = $('.label:contains('+ ui.owner +') ~ .value',cd); 
    var owner = $(v).data('principal');
    var ownerName = $(v).text();
    var url = owner + guid();
    var cals = $(document).caldav('calendars');
    var p = $('#callist > li > span:contains('+ownerName+')').next();
    var i = cals.length;

    var color = modified['calendar-color'].value;
    console.log( 'color ' + color );
    var ss = styles.getStyleSheet ( 'calstyle' );
    ss.updateRule ( '.calendar'+i ,{ color: color }  );
    ss.updateRule ( '.calendar'+i +':hover',{ 'background-color': color } );
    ss.updateRule ( '.calendar'+i +'bg',{ 'background-color': color } );
    
    cals[i] = {};
    cals[i].order = modified['calendar-order'].value;
    cals[i].displayName = modified['displayname'].value;
    cals[i].desc = modified['calendar-description'].value;
    cals[i].href = url + '/';
    cals[i].url = $('.jqcaldav:first').data('caldavurl').replace(/([a-z])\/.*$/,'$1') +  url + '/'; 
    var ce = $('<li class="calendar'+i+'" order="'+cals[i].order+'" title="'+cals[i].desc+'"><input type="checkbox" id="calendar'+i+'" checked="true" /><span >'+cals[i].displayName+'</span></li>');
    $(ce)[0].addEventListener('drop',calDrop,true);
    $(ce)[0].addEventListener('dragenter', calDragEnter,true);
    $(ce)[0].addEventListener('dragover', calDragOver,true);
    $(ce).click (selectCalendar);
    $(ce).dblclick (editCalendar);
    $(ce).data(cals[i]);
    $(p).append(ce);
    eventSort(p);
  }
  else
  {
    if ( modified['displayname'] != undefined )
    {
      $('#callist ul[data-principal="'+cal+'"]').parent().children('span').text(modified['displayname'].value); 
      $.fn.caldav.principals[c].displayName = modified['displayname'].value;
      $.fn.caldav.collectionData[c].displayName = modified['displayname'].value;
    }
    if ( modified['calendar-description'] != undefined )
    {
      $('#callist ul[data-principal="'+cal+'"]').parent().children('span').attr('title',modified['calendar-description'].value);
      $.fn.caldav.principals[c].desc = modified['calendar-description'].value;
      $.fn.caldav.collectionData[c].desc = modified['calendar-description'].value;
    }
  }
  if ( edited )
  {
    console.log(modified); 
    if ( cal == 'new' )
      $(document).caldav('makeCalendar', {url:url},cal,modified);
    else
      $(document).caldav('updateCollection', {},cal,modified);
    if ( write && acledited )
      $.acl({url:cals[c].href,username:$.fn.caldav.options.username,password:$.fn.caldav.options.password,data:newacl,
        complete:function(r,s){
          console.log ( newacl )
          if (s!='success')
            alert('error setting privileges');
          else
          {
            var na = $(newacl);
            $('acl',$.fn.caldav.collectionData[c].xml).replaceWith(na);
          }
        }});
  }
  return true;
}

function completePrincipal(e)
{
  if ( ( e.keyCode == 13 || e.keyCode == 9 ) && $(e.target).prev().find('.selected').length > 0  )
  {
    $(e.target).text($(e.target).prev().find('.selected').text());
    $(e.target).attr('data-principal',$(e.target).prev().find('.selected').attr('data-href'));

    $(e.target).attr('data-email',$(e.target).prev().find('.selected').attr('data-mail'));
    $(e.target).data('principal',$(e.target).prev().find('.selected').attr('data-href'));
    $(e.target).data('email',$(e.target).prev().find('.selected').attr('data-mail'));
    $(e.target).data('value',$(e.target).prev().find('.selected').attr('data-mail'));
    $(e.target).data('new-email',$(e.target).prev().find('.selected').attr('data-mail'));
    $(e.target).data('new-text',$(e.target).prev().find('.selected').text());

    $(e.target).prev().children('.completion').empty();
    $(e.target).removeData('matches');
    $(e.target).blur();
    e.preventDefault();
    return false;
  }
  else if ( ( e.keyCode == 13 || e.keyCode == 9 ) && $(e.target).text().length > 1 && $(e.target).data('matches') )
  {
    $(e.target).text($(e.target).data('matches')[0].name);
    $(e.target).attr('data-principal',$(e.target).data('matches')[0].href);
    
    $(e.target).attr('data-email',$(e.target).data('matches')[0].email);
    $(e.target).data('new-email',$(e.target).data('email')[0].email);
    $(e.target).data('new-text',$(e.target).data('matches')[0].name);

    $(e.target).prev().children('.completion').empty();
    $(e.target).blur();
    e.preventDefault();
    return false;
  }
  else if ( e.keyCode == 13 )
  {
    e.preventDefault();
    return false;
  }
  else if ( e.keyCode == 40 ) // down arrow
  {
    if ( $(e.target).prev().children('.completion').children('.selected').length > 0 )
      $(e.target).prev().children('.completion').children('.selected').removeClass('selected').next().addClass('selected');
    else
      $(e.target).prev().children('.completion').children().first().addClass('selected');
    e.preventDefault();
    return false;
  }
  else if ( e.keyCode == 38 ) // uparrow
  {
    if ( $(e.target).prev().children('.completion').children('.selected').length > 0 )
      $(e.target).prev().children('.completion').children('.selected').removeClass('selected').prev().addClass('selected');
    else
      $(e.target).prev().children('.completion').children().last().addClass('selected');
    e.preventDefault();
    return false;
  }
  var s;
  if ( e.keyCode == 8 )
  { 
    s = $(e.target).text().slice(0,-1);
    if ( $(e.target).text().length < 1 )
    { 
      e.preventDefault();
      return false;
    }
  }
  else
    s = $(e.target).text()+String.fromCharCode(e.keyCode);
  var ignoreKeys=[9,13,27,33,34,35,36,37,38,39,40,45,46];
  if ( s.length > 1 && ignoreKeys.indexOf(e.keyCode) == -1 )
  {
    $(document).caldav ('searchPrincipals',{url: $('.jqcaldav:first').data('caldavurl')},'displayname',s,
      function (a)
      {
        var matches = new Array;
        var text='';
        var m = $('response',a);
        for (var i=0;i<m.length;i++)
        {
          matches.push({name:$('displayname',m[i]).text(),href:$('>href:eq(0)',m[i]).text(),mail:$("href:contains('mailto')",m[i]).text()});
          text += '<div data-href="'+$('href:eq(0)',m[i]).text()+'" data-mail="'+$("href:contains('mailto')",m[i]).text()+'">' + $('displayname',m[i]).text() + '</div>';
        }
        $(e.target).data('matches',matches);
        var off = $(e.target).position();
        $(e.target).prev().css({top:off.top,left:off.left});
        $(e.target).prev().children('.completion').html(text);
        $(e.target).prev().children('.completion').children().first().addClass('selected');
        $(e.target).prev().children('.completion').children().click(function(a){$(e.target).text(a.target.textContent);
          $(e.target).attr('data-principal',$(a.target).data('href'));
          $(e.target).attr('data-email',$(a.target).data('email'));
          $(e.target).data('email',$(a.target).data('email'));
          $(e.target).data('new-text',$(a.target).text());
          $(a.target).parent().empty();
          $(e.target).blur();
          a.stopPropagation();
          a.preventDefault();
          return false;
          });
      });
  }
  else if ( $(e.target).prev().children('.complteion').children().length > 0 )
    $(e.target).prev().children('.completion').empty();
}

function keyboardSelector (e)
{ 
  var et = $(e.target).prev().children('.completion');
  //$('.highlighted',et).removeClass('highlighted');
  switch ( e.keyCode )
  {
    case 40:// ) // down arrow
      if ( $('.highlighted',et).length > 0 )
        $('.highlighted',et).removeClass('highlighted').first().next().addClass('highlighted');
      else
        $(et).children().first().addClass('highlighted');
      if ( $('.highlighted',et).length == 0 )
        $(et).children().first().addClass('highlighted');
      $(et).scrollTop($('.highlighted',et).position().top - $(et).height() /2 );
      e.preventDefault();
      return false;
    case 38:  // uparrow
      if ( $('.highlighted',et).length > 0 )
        $('.highlighted',et).removeClass('highlighted').first().prev().addClass('highlighted');
      else
        $(et).children().last().addClass('highlighted');
      if ( $('.highlighted',et).length == 0 )
        $(et).children().last().addClass('highlighted');
      $(et).scrollTop($('.highlighted',et).position().top - $(et).height() /2 );
      e.preventDefault();
      return false;
    case 32:  // space
      if ( e.spaceSelects !== true )
        return true;
    case 13:  // enter prevent default on enter
      e.preventDefault();
    case 9:   // HTAB do not prevent default on tab
      return $('.highlighted',et); //return jquery object even if empty
    case 8:   // prevent backspacing past the beginning of the field 
      if ( $(e.target).text().length == 0 )
        e.preventDefault();
      return false;
    case 27: // escape
      if ( e.removeOnEscape === true )
        $(this).prev().fadeOut(function(){$(this).remove();});
      else
        $(et).empty();
      e.preventDefault();
      return 'cancel';
  }
  if ( e.search === true && ! e.altKey && ! e.ctrlKey && ! e.metaKey && String.fromCharCode(e.keyCode).match(/[A-Za-z0-9.,:\=+-]/) )
  {
    var n = $.now();
    var lkt = $(e.target).data('lastKeypressTime');
    $(e.target).data('lastKeypressTime',n);
    e.preventDefault();
    $('.highlighted',et).removeClass('highlighted');
    var st = '';
    if ( n - lkt < 500 )
      st = $(e.target).data('lastKeypressString');
    st = st + String.fromCharCode(e.keyCode);
    $(e.target).data('lastKeypressString',st);
    var RE = new RegExp('^'+st,'i');
    var matches = $(et).children().filter(function(index){return RE.test($(this).text())});
    var RE = new RegExp(st,'i');
    if ( $(matches).length == 0 )
      matches = $(et).children().filter(function(index){return RE.test($(this).text())});
    if ( $(matches).length == 1 )
      $(matches).addClass('highlighted');
    else if ( $(matches).length > 1 )
      $(matches).addClass('highlighted');
    return false;
  }
  return true;
}

// scrolling for dates
function dateScroll (e )
{
  if ( e.wheelDelta == undefined )
    var z = e.detail;
  else
    var z = 0 - (Math.abs(e.wheelDelta) >= 3 ? ( Math.abs(e.wheelDelta)> 29? Math.round(e.wheelDelta/30):Math.round(e.wheelDelta/3)): e.wheelDelta);
  if ( Math.abs(z) > 2 )
    z = Math.round(z/3);
  var off = 0;
  if ( document.caretRangeFromPoint )
  {
    var r = document.caretRangeFromPoint(e.originalEvent.pageX,e.originalEvent.pageY);
    off = r.startOffset;
  }
  else if ( e.originalEvent.rangeOffset )
  {
    off = e.originalEvent.rangeOffset;
  }
  else
  {
    // fake it, poorly
    off = Math.round ( $(e.target).text().length * ( e.offsetX / $(e.target).width() ) );
    console.log ( 'offset ' + off + '  from ' + $(e.target).width() + '/' + e.offsetX );
  }
  var dlen = String($(e.target).text()).replace ( /^(\s*[0-9]{2,4}\s*[,./';: ]\s*[0-9]{2,4}\s*[,./';: ]\s*[0-9]{2,4}\s+).*$/, '$1').length;
  try {
    var dt = (new Date).Zero().parsePrettyDate($(e.target).text());
  }catch(e){// stop if it ain't a date
    return ;
  }
  if ( off < dlen )
  {
    //adjust date
    dt.add('d',z);
    console.log ( 'moved ' + z + ' @ dlen =' + dlen + ' and off =' + off );
  }
  else
  {
    // adjust time
    var timeparts = String($(e.target).text()).slice(dlen-1).split(/:/);
    if ( off > dlen + timeparts[0].length )
    {
      if ( Number ( timeparts[1] )  % 5 != 0 )
      {
        if ( Number ( timeparts[1] ) <= 57 )
        {
          dt.setUTCMinutes(Math.round(Number ( timeparts[1] ) / 5) * 5);
        }
        else
        {
          dt.setUTCMinutes(60);
        }
      }
      dt.add('M',z * 5);
    }
    else
      dt.add('h',z);
    console.log ( 'moved ' + z + ' @ dlen =' + dlen + ' hlen =' + timeparts[0].length + ' and off =' + off );
  }
  $(e.target).text (dt.prettyDate());
}

// get inbox events for principal
function getInbox ( p )
{
  if ( $.fn.caldav.inboxMap && $.fn.caldav.inboxMap[$.fn.caldav.data.myPrincipal] )
    $(document).caldav('getAll',{},gotInbox,'VEVENT',$.fn.caldav.inboxMap[$.fn.caldav.data.myPrincipal]);
}

function gotInbox ( e )
{
  for ( var i=0;i<e.length;i++ )
  {
    if ( e[i].text.length < 10 )
      continue ;
    var em = new String(e[i].text);
    var parsed = new iCal ( em );
    parsed.eTag =e[i].etag;
    for ( var ev in parsed.ics )
    {
      insertInvite ( e[i].href, parsed.ics[ev] );
    }
  }
}

function showVisTodos ( e )
{
  if ( $(e.target).prev().hasClass('completionWrapper') )
  {
    $('#caltodo .completionWrapper').remove();
    return ;
  }
  var sp = String($('#caltodo > ul').attr('show')).split(',');
  var options = ['COMPLETED','CANCELLED','NEEDS-ACTION','IN-PROCESS','past due','upcoming'];
  var nv = [];
  for ( var i =0; i < options.length; i++ )
    if ( sp.indexOf(options[i]) > -1 )
      nv.push(valueNames[options[i]]);
  txt = nv.join(','); 
  console.log(txt);
  $(e.target).text(txt);
  //completed,canceled,due,needs-action,in-process
  var comp = buildOptions({target:e.target,
    options:['COMPLETED','CANCELLED','NEEDS-ACTION','IN-PROCESS','past due','upcoming'],
    text:  valueNames, 
    none:false,multiselect:',',callback:showHideTodos});
  $(comp).css({width: '8em','text-align': 'left'});
  $(e.target).text(ui.show);
  $('#caltodo .completionWrapper').remove();
  $(e.target).before(comp);
  //console.log(e);
}

function showHideTodos ( e )
{
  var txt = $(e).text();
  console.log(txt);
  var sp = String(txt).split(',');
  var options = ['COMPLETED','CANCELLED','NEEDS-ACTION','IN-PROCESS','past due','upcoming'];
  var nv = [];
  for ( var i = 0; i < options.length; i++ )
    if ( sp.indexOf(valueNames[options[i]]) > -1 )
      nv.push(options[i]);
  txt = nv.join(',');
  $('#caltodo > ul').attr('show',txt);
  console.log(txt);
  settings.todoShow = txt;
  saveSettings(false);
  $(e).text(ui.show);
  $('#caltodo .completionWrapper').remove();
  $('#caltodo .event').each(function(i,e)
    {
      if ( todoVisible(e) ) 
        $(e).removeClass('hidden');
      else
        $(e).addClass('hidden');
    });
}

function showSortTodos ( e )
{
  if ( $(e.target).prev().hasClass('completionWrapper') )
  {
    $('#caltodo .completionWrapper').remove();
    return ;
  }
  $(e.target).text($('#caltodo > ul').attr('sort'));
  var comp = buildOptions({target:e.target,
    options:['priority','percent-complete','due','manual'],
    text:   {'priority':fieldNames.priority,'percent-complete':fieldNames['percent-complete'],'due':fieldNames.due,'manual':ui.manual},
    none:false,callback:sortTodos});
  $(comp).css({width: '8em','margin-left':'-2em','margin-top':'1em','text-align': 'left'});
  $(e.target).text(ui.sort);
  $('#caltodo .completionWrapper').remove();
  $(e.target).before(comp);
}

function sortTodos ( e )
{
  var txt = $(e).text();
  var prev = $('#caltodo > ul').attr('sort');
  if ( prev == txt )
  {
    if ( settings.todoSortReverse )
      settings.todoSortReverse = false; 
    else
      settings.todoSortReverse = true; 
  }
  else
  {
    if ( txt == 'priority' )
      settings.todoSortReverse = true; 
    else
      settings.todoSortReverse = false; 
  }
  $('#caltodo > ul').attr('sort',txt);
  settings.todoSort = txt;
  saveSettings(false);
  $(e).text(ui.sort);
  todoSort($('#caltodo ul' ));
}

function todoVisible ( e )
{
  var txt = $('#caltodo > ul').attr('show');
  var ret = true;
  var opts = String(txt).split(',');
  console.log ( opts );
  if ( opts.indexOf('COMPLETED') == -1 && ( $(e).attr('completed') || $(e).attr('status') == 'completed' ) )
    ret = false;
  if ( opts.indexOf('CANCELLED') == -1 && $(e).attr('status') == 'cancelled' )
    ret = false;
  if ( opts.indexOf('NEEDS-ACTION') == -1 && $(e).attr('status') == 'needs-action' )
    ret = false;
  if ( opts.indexOf('IN-PROCESS') == -1 && $(e).attr('status') == 'in-process' )
    ret = false;
  var d  = $(e).attr('due'); 
  if ( opts.indexOf('past due') == -1 && d != undefined && String(d).length > 4 && d < $.now() )
    ret = false;
  if ( opts.indexOf('upcoming') == -1 && d != undefined && String(d).length > 4 && d > $.now() )
    ret = false;
  return ret;
}

function addEvents ( e ,c, start, end )
{
  var dRX = /([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?[Zz]?/;
  var now;
  for ( var i=0;i<e.length;i++ )
  {
    if ( e[i].text.length < 10 )
      continue ;
    now = $.now();
    var em = new String(e[i].text);
    var parsed = new iCal ( em );
    perf[6].push($.now()-now);
    parsed.eTag =e[i].etag;
    for ( var ev in parsed.ics )
    {
      insertEvent ( e[i].href, parsed.ics[ev], c, start, end );
      perf[7].push($.now()-now);
    }
    perf[8].push($.now()-now);
  }
}

function addToDos ( e ,c )
{
  var dRX = /([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?[Zz]?/;
  for ( var i=0;i<e.length;i++)
  {
    if ( e[i].length < 10 )
      continue ;
    var em = new String(e[i].text);
    var parsed = new iCal ( em );
    for ( var ev in parsed.ics )
    {
      insertTodo ( e[i].href, parsed.ics[ev], c );
    }
  }
}

function addSubscribedEvents( c, start, end )
{
  var scals = $('#wcal').data('subscribed');
  if ( c < 0 )
  {
    for ( var s in scals )
    {
      if ( scals[s].events == undefined )
        continue;
      for ( var e in scals[s].events.recurrence )
        if ( e.TYPE == 'vevent' )
          insertEvent(scals[s]['src']+'_event-'+e.vevent.uid,e,s,start,end);
      var d = new Date(start).YM();
      while ( d <= end )
      {
        for ( var e in scals[s].events.index[d.YM()] )
        {
          var evt = scals[s].events.index[d.YM()][e];
          if ( evt.TYPE == 'vevent' )
          {
            $('#wcal').queue(function (){insertEvent(scals[s]['src']+'_event-'+String(evt.vcalendar.vevent.uid),evt,s,start,end); $(this).dequeue();});
          }
        }
        d.add('m',1);
      }
    }
  }
  else
  {
    s = c;
    for ( var e in scals[s].events.recurrence )
      if ( e.TYPE == 'vevent' )
        insertEvent(scals[s]['src']+'_event-'+e.vevent.uid,e,s,start,end);
    for ( var e in scals[s].events.ics )
      if ( scals[s].events.ics[e].TYPE == 'vevent' && 
          ( scals[s].events.ics[e].vcalendar.vevent.dtstart.DATE > start && 
            scals[s].events.ics[e].vcalendar.vevent.dtstart.DATE < end ) )
        insertEvent(scals[s]['src']+'_event-'+scals[s].events.ics[e].vcalendar.vevent.uid,scals[s].events.ics[e],s,start,end);
  }
}

var eventcount = 0;
function insertEvent ( href, icsObj, c, start, end , current)
{
  var desc = '';
  var now = (new Date()).getTime();
  var cals = $(document).caldav('calendars');
  if ( typeof end != "object" &&  typeof start != object && ( end < $('#wcal').data('firstweek' ) || start > $('#wcal').data('lastweek') ) )  
    return ;
  if ( icsObj.vcalendar.vevent == undefined && current == undefined )
  {
    for ( var i =0; i < icsObj.vcalendar.length; i++ )
      insertEvent ( href, icsObj, c, start, end, etag , i );
    return; 
  }
  else if ( icsObj.vcalendar.vevent == undefined && current > -1  )
    var cevent = icsObj.vcalendar[current].vevent;
  else
    var cevent = icsObj.vcalendar.vevent;
  if ( cevent.rrule != undefined )
  {
    var expan = cevent.rrule.RECURRENCE.expandRecurrence(cevent.dtstart.VALUE,dateAdd(end,'d',7));
  }
  var estart = cevent.dtstart.DATE;
  if ( cevent.dtend != undefined )
    var eend = cevent.dtend.DATE;
  else if ( cevent.duration != undefined )
  {
    var eend = new Date(estart.getTime());
    eend.addDuration ( cevent.duration.DURATION );
    if ( debug )
      console.log ( estart, cevent.duration.DURATION );
  }
  else
    var eend = estart;
  // make sure millisecond differences don't effect event durations
  var tdiff = Math.floor ( ( eend - estart ) / 100 ) * 100 ;
  var run = new Array ();
  if ( expan != undefined )
  {
    for ( var i in expan )
      if ( expan[i] > start && expan[i] < end )
        run[i] = expan[i];
  }
  else
    run[estart.DayString()] = estart;
  perf[0].push($.now()-now);
  $('#wcal li.calendar'+c+'[href="'+href+'"]').remove();
  //if ( globalEvents.href[href] != undefined && String(cevent.uid.VALUE).length > 0 )
  //  var otherOcurrences = $('#wcal li.calendar'+c+'[uid="'+cevent.uid.VALUE+'"][original=0]');
  //else
    var otherOcurrences = $('#wcal > #DOESNTEXIST');
  for ( var i in run )
  {
    var estart = run[i]; 
    if ( cevent.exdate != undefined )
    {
      if ( cevent.exdate.DATES )
      {
        if ( $.grep(cevent.exdate.DATES,function (v,i)
              {
                return cevent.exdate.DATES[i].getTime()==estart.getTime()?true:false;
              }).length > 0 )
          continue;
      }
      else if ( cevent.exdate.DATE.getTime() == estart.getTime() )
        continue;
    }
    if ( otherOcurrences.length > 0 )
    {
      var cont = false;
      for ( var z=0;z<otherOcurrences.length;z++ )
      {
        var oo = $(otherOcurrences[z]).data('ics');
        if ( oo.vcalendar.vevent == undefined  )
        {
          for ( var zz in oo.vcalendar )
            if ( oo.vcalendar[zz].vevent['recurrence-id'] != undefined && oo.vcalendar[zz].vevent['recurrence-id'].DATE == estart ) { cont = true; }
        }
        else
          if ( oo.vcalendar.vevent['recurrence-id'] != undefined && oo.vcalendar.vevent['recurrence-id'].DATE == estart ) cont = true;
      }
      if ( cont ) continue;
    }
    if ( cevent.summary && cevent.summary.VALUE != undefined )
      var summary = cevent.summary.VALUE;
    else
      var summary = '';

    perf[1].push($.now()-now);
    /////////// handle alarms
    if ( cevent.valarm != undefined && estart.getTime() > now - 86400000 && estart.getTime() < now + 86400000 * 40  && settings.usealarms )
    {
      var alarms = [];
      if ( cevent.valarm.action != undefined )
        alarms.push(cevent.valarm);
      else
        alarms = cevent.valarm;
      for ( var A in alarms )
      {
        if ( debug ) console.log ( 'adding alert for ' + summary );
        if ( alarms[A].trigger != undefined && alarms[A].action.VALUE == "AUDIO" || alarms[A].action.VALUE == "DISPLAY" )
        {
          if ( alarms[A].trigger.DURATION != undefined )
          {
            if ( alarms[A].trigger.PROP && alarms[A].trigger.PROP.related && alarms[A].trigger.PROP.related == 'END' )
              var atime = new Date(eend.getTime()).localTzRemove();
            else
              var atime = new Date(estart.getTime()).localTzRemove();
            atime.addDuration(alarms[A].trigger.DURATION);
          }
          else if ( alarms[A].trigger.DATE != undefined )
          {
            var atime = alarms[A].trigger.DATE;
          }
          else 
            continue ;
          var atext = '';
          if ( alarms[A].description != undefined )
            atext = alarms[A].description;
          else
            atext = summary + ' ' + (atime.getTime()-now>86400000?estart.prettyDate():estart.prettyTime());
          if ( atime.getTime()-now <= 30000 )
            continue;
          if (debug) console.log('alert in ' + ( atime.getTime()-now )/1000 + ' seconds: ' + atext ); 
          alerts.push(window.setTimeout(function(){$('#calalertsound')[0].play();alert(atext);alerts.shift();},atime.getTime()-now));
        }
      }
    }
    if ( tdiff <= 86400000 ) 
    {
      if ( tdiff < 86400000 )
      {
        desc = estart.prettyTime() + ' ';
        var time = estart.TimeString();
      }
      else
        var time = 0; 

      desc += summary; 
      var transp = cevent.transp!=undefined?cevent.transp.VALUE:'TRANSPARENT';
      var status = cevent.status!=undefined?'status="'+cevent.status.VALUE+'"':'';
      var duration = 0+parseInt(tdiff/900000)*15;
      if ( debug ) console.log ( 'duration',duration, tdiff );
      if ( duration >= (settings.end.getLongMinutes() - settings.start.getLongMinutes() )/25*15 )
        duration = 1;
      var etime = parseInt(time/10000)*100;
      etime = etime + Math.round((parseInt(time/100)-etime )/15) * 15 ;
      var entry = new Array;
      if ( cevent['recurrence-id'] != undefined )
      {
        if ( String(cevent.uid.VALUE).length > 0 )
          var entry = $('#day_' + cevent['recurrence-id'].DATE.DayString() + ' li[uid="'+cevent.uid.VALUE+'"]' ).detach();
        else
          var entry = $('#day_' + cevent['recurrence-id'].DATE.DayString() + ' li[instance="'+estart.DateString()+'"]' ).detach();
        var recurencesMoved = $('#wcal').data('cal'+c+href); 
        if ( typeof recurencesMoved != "object" )
          recurencesMoved = new Object ();
        recurencesMoved[cevent['recurrence-id'].VALUE] = eventcount;
        $('#wcal').data('cal'+c+href,recurencesMoved); 
        var b = true;
      }
      if ( entry.length == 0 )
        var entry = $('<li class="event calendar' + c + ' time' + etime + '" data-duration="' + duration + '" draggable="true" data-time="' + time + '" href="' + href + '" eventcount="'+eventcount+'" uid="' + cevent.uid.VALUE + '" instance="' + estart.DateString() +  '" transparent="' + transp + '" '+status+' >'+desc+'</li>');
      //if ( time == 0 )
      //  $(entry).addClass('calendar' + c + 'bg');
      $(entry).data('ics', icsObj);
      $(entry).attr('owner',cals[c].owner);
      $(entry).attr('sequence',0);
      if ( cevent.sequence != undefined )
        $(entry).attr('icssequence',cevent.sequence.VALUE);
      if ( cevent['recurrence-id'] != undefined )
        $(entry).attr('original',0);
      else
        $(entry).attr('original',1);
      if ( cals[c].perms.write || cals[c].perms['write-content'] )
      {
        $(entry).click( eventClick );
        $(entry)[0].addEventListener('dragstart',calDragStart,true);
        $(entry)[0].addEventListener('dragend',calDragEnd,true);
        if ( $(entry)[0].dragDrop != undefined )
        {
          $(entry)[0].addEventListener('dragover',calDragOver,true);
          $(entry)[0].addEventListener('drag',calDragOver,true);
          $(entry)[0].addEventListener('mousemove',function(e){if (window.event.button == 1)e.currentTarget.dragDrop();},true);
        }
      }
      $(entry).hover(eventHover,eventMouseout);
      perf[2].push($.now()-now);
      if ( $('#calendar'+c).attr('checked') )
        $(entry).hide();
      else
        $(entry).attr('lang','x-klingon');
      if ( globalEvents.href[href] == undefined || $('#day_' +  estart.DayString() + ' li[href="'+href+'"]' ).length < 1 )
      {
        if ( $('#calendar'+c).attr('checked') )
          $(entry).appendTo($('#day_' +  estart.DayString() + ' ul.eventlist' )).fadeIn();
        else
          $(entry).appendTo($('#day_' +  estart.DayString() + ' ul.eventlist' ));
        $(entry).removeAttr('style');
        eventcount++;
        eventSort($('#day_' +  estart.DayString() + ' ul.eventlist' ));
      }
      else
      {
        if ( $('#calendar'+c).attr('checked') )
          $(entry).show();
        $('#day_' +  estart.DayString() + ' li[href="'+href+'"]' ).replaceWith(entry);
        eventcount++;
        eventSort($('#day_' +  estart.DayString() + ' ul.eventlist' ));
      }
      globalEvents.href[href] = icsObj;
      perf[4].push($.now()-now);
    }
    else 
    {
      var time = '0.'+ estart.DayString() ; 
      desc += summary; 
      var transp = cevent.transp!=undefined?cevent.transp.VALUE:'OPAQUE';
      var entry = new Array;
      var currentevent = eventcount;
      if ( cevent['recurrence-id'] != undefined )
      {
        if ( String(cevent.uid.VALUE).length > 0 )
          var entry = $('#day_' + cevent['recurrence-id'].DATE.DayString() + ' li[uid="'+cevent.uid.VALUE+'"]' ).detach();
        else
          var entry = $('#day_' + cevent['recurrence-id'].DATE.DayString() + ' li[instance="'+estart.DateString()+'"]' ).detach();
        var currentevent = $(entry).attr('eventcount');
        $('[eventcount="'+$(entry).attr('eventcount')+']"').remove();
      }
      var entry = $('<li class="event calendar' + c + ' calendar' + c + 'bg" draggable="true" data-time="' + time + '" href="' + href + '" eventcount="'+currentevent+'" uid="' + cevent.uid.VALUE + '" instance="' + estart.DateString() + '" transparent="' + transp + '" >'+desc+'</li>');
      $(entry).attr('owner',cals[c].owner);
      if ( current != undefined )
        icsObj.current = current;
      $(entry).data('ics', icsObj);
      if ( cevent['recurrence-id'] != undefined )
        $(entry).attr('original',0);
      else
        $(entry).attr('original',1);
      if ( cevent.sequence != undefined )
        $(entry).attr('icssequence',cevent.sequence.VALUE);
      $(entry).addClass('multiday');
      if ( cals[c].perms.write || cals[c].perms['write-content'] )
      {
        $(entry).click( eventClick );
        $(entry)[0].addEventListener('dragstart',calDragStart,true);
        $(entry)[0].addEventListener('dragend',calDragEnd,true);
        if ( $(entry)[0].dragDrop != undefined )
          $(entry)[0].addEventListener('mousemove',function(e){if (window.event.button == 1)e.currentTarget.dragDrop();},true);
      }
      $(entry).hover(eventHover,eventMouseout);
      perf[2].push($.now()-now);
      if ( $('#calendar'+c).attr('checked') )
      {
        $(entry).hide();
        $(entry).attr('lang','x-klingon');
      }
      else
        $(entry).attr('lang','x-klingon');
      eventcount++;
      for (var j=0;j*86400000<tdiff;j++)
      {
        var nd = new Date(estart.getTime()+j*86400000);
        var cloned  = $(entry).clone(true);
        $(cloned).attr('sequence',j);
        if ( j == 0 )
          $(cloned).addClass('eventstart');
        if ( (j+1)*86400000 >= tdiff )
          $(cloned).addClass('eventend');
        if ( cals[c].perms.write || cals[c].perms['write-content'] )
        {
          $(cloned)[0].addEventListener('dragstart',calDragStart,true);
          $(cloned)[0].addEventListener('dragend',calDragEnd,true);
        }
        if ( $('#day_' +  nd.DayString() + ' li[href="'+href+'"]' ).length < 1 )
        { 
          if ( $('#calendar'+c).attr('checked') )
            $(cloned).appendTo($('#day_' +  nd.DayString() + ' ul.eventlist' )).fadeIn();
          else
            $(cloned).appendTo($('#day_' +  nd.DayString() + ' ul.eventlist' ));
          $(cloned).attr('style','');
          eventSort($('#day_' +  nd.DayString() + ' ul.eventlist' ));
        }
        if ( j == 0 )
          $(entry).html('&nbsp;');
      }
      globalEvents.href[href] = icsObj;
      perf[5].push($.now()-now);
    }
  }
}

function perfStats()
{
  var p=[],n,m;
  for (var i=0;i<perf.length;i++)
  {
    p[i]=0;
    n=perf[i][0];
    m=perf[i][0];
    for ( var j=0;j<perf[i].length;j++)
    {
      p[i]+=perf[i][j];
      if(perf[i][j]<n)
        n=perf[i][j];
      if(perf[i][j]>m)
        m=perf[i][j];
    }
    console.log(i + ' count: '+j+' min:'+n+' max:'+m+' median:'+(n+(m-n)/2)+' avg:'+(p[i]/j));
  }
}

function insertTodo ( href, icsObj, c  )
{
  var type = icsObj.TYPE;
  var sortorder = icsObj.vcalendar[type]['x-apple-sort-order'];
  var desc = '';
  var cals = $(document).caldav('calendars');
  desc += icsObj.vcalendar[type].summary.VALUE; 
  if ( icsObj.vcalendar[type].uid )
    var uid = icsObj.vcalendar[type].uid.VALUE;
  else
    var uid = '';
  var entry = $('<li class="event calendar' + c + '" data-time="' + sortorder + '" href="' + href + '" uid="' + uid + '" draggable="true" >'+desc+'</li>');
  $(entry).attr('owner',cals[c].owner);
  if ( icsObj.vcalendar[type].due && icsObj.vcalendar[type].due.DATE)
    $(entry).attr('due',icsObj.vcalendar[type].due.DATE.getTime());
  $(entry).attr('completed',icsObj.vcalendar[type].completed);
  $(entry).attr('priority',icsObj.vcalendar[type].priority);
  $(entry).attr('percent-complete',icsObj.vcalendar[type]['percent-complete']);
  $(entry).attr('status',icsObj.vcalendar[type].status);
  $(entry).data('ics', icsObj );
  $(entry).hover(eventHover,eventMouseout);
  if ( cals[c].perms.write || cals[c].perms['write-content'] )
  {
    $(entry).click(eventClick); 
    $(entry)[0].addEventListener('dragstart',calDragStart,true);
    $(entry)[0].addEventListener('dragend',calDragEnd,true);
  }
  if ( $('#caltodo ul li[href="' + href + '"]').length > 0 )
    $('#caltodo ul li[href="' + href + '"]').remove();
  if ( $('#calendar'+c).attr('checked') )
  {
    if ( ! todoVisible(entry) )
      $(entry).addClass('hidden').appendTo($('#caltodo ul' ));
    else
      $(entry).hide().appendTo($('#caltodo ul' )).fadeIn('fast',function(){$(this).removeAttr('style')});
  }
  else
    $(entry).appendTo($('#caltodo ul' ));
  todoSort($('#caltodo ul' ));
}

function insertInvite ( href, icsObj )
{
  var type = icsObj.TYPE;
  var desc = '';
  if ( ! icsObj.vcalendar.method )
    return ; // not a scheduling request, ignore it
  if ( icsObj.vcalendar[type].summary ) 
    desc += icsObj.vcalendar[type].summary.VALUE; 
  if ( icsObj.vcalendar[type].uid )
    var uid = icsObj.vcalendar[type].uid.VALUE;
  else
  {
    if ( debug )
      console.log(href + ' is invalid, no uid' );
    var uid = '';
  }
  if ( icsObj.vcalendar[type].dtstart )
    var sortorder = icsObj.vcalendar[type].dtstart.DATE.getTime();
  else
    var sortorder = 1;
  var from = '' ;
  if ( icsObj.vcalendar[type].organizer ) 
    from = String ( icsObj.vcalendar[type].organizer );
  if ( $('#calinvites .event[href="'+href+'"]').length > 0 )
  {
    // TODO update existing invite if etag changed 
    $('#calinvites .event[href="'+href+'"]').remove();
    //return; 
  }
  var entry = $('<li class="event calendar0" data-method="'+ icsObj.vcalendar.method +'" data-time="' + sortorder + '" href="' + href + '" uid="' + uid + '" data-from="'+from+'" >'+desc+'</li>');
  $(entry).attr('status',icsObj.vcalendar[type].status);
  /* // TODO make invites draggable to accept ( drop on calendar to accept and insert )
     // probably will have to find the existing event by UID and move it if it exists
  $(entry)[0].addEventListener('dragstart',calDragStart,true);
  $(entry)[0].addEventListener('dragend',calDragEnd,true);
  */
  $(entry).data('ics', icsObj );
  $(entry).hover(eventHover,eventMouseout);
  $(entry).click(inviteClick); 
  $(entry).appendTo($('#calinvites'));
}

function inviteClick(e)
{
  $('#calpopupe').remove();
  $('#wcal').removeData('popup');
  e.stopPropagation();
  eventHover(e);
  var cp = $($('#wcal').data('popup'));
  var href = $($(cp).data('event')).attr('href');
  var cals = $(document).caldav('calendars');
  var c = $($(cp).data('event')).attr('class').match(/calendar(\d+)/)[1];
  $('#calpopup').clone(true).attr('id','calpopupe').removeClass('left right bottom').appendTo('#calwrap');
  $('#wcal').data('popup','#calpopupe');
  $('#calpopupe').data('overflow',0);
  $('#calpopup').hide();
  var lh = $('#calpopupe').innerHeight() - $('#calpopupe').height();
  if ( $('#calpopupe > ul').outerHeight()  + lh * 1.5 + 10 > $('#calpopupe').height() )
    $('#calpopupe').height($('#calpopupe > ul').outerHeight()  + lh * 1.5 + 10);
  $('#calpopupe').data('fields',fieldNames);
  $('#calpopupe').css('opacity',1);
  var method = $(e.target).data('method');
  if ( method == 'REQUEST' )
  {
    $('#calpopupe').append('<div class="schedulebuttons group"><div class="button accept" tabindex="0">'+ui.accept+'</div><div class="button maybe" tabindex="0">'+ui.maybe+'</div><div class="button decline" tabindex="0">'+ui.decline+'</div></div>');
  }
  else if ( method == 'CANCEL' || method == 'REPLY' )
  {
    $('#calpopupe').append('<div class="button done" tabindex="0">'+ui.done+'</div>');
  }
  if ( debug ) 
  {
    $('#calpopupe').append('<div class="button tweak" style="position:absolute;bottom:5px;left:70px; width:40px;" tabindex="0">tweak</div>'); // for debugging, not translated
    $('#calpopupe .tweak').bind ('click',
        function (e)
        {
          var cp = $($('#wcal').data('popup'));
          var cal = cals[c];
          var src  = $('<textarea id="eventsource" style="position:absolute;top:0;left:0;background:grey; overflow-y: auto; white-space: pre;" cols="80" rows="30" contenteditable="true" ></textarea>');
          var save = $('<div id="eventsave" style="position:absolute;bottom:25px;left:70px; width:40px;" class="button">save</div>');
          var d = $($(cp).data('event')).data('ics');
          $(src).text(d.PARENT.printiCal());
          $(save).click(function(e){
            var ics = new iCal ( $('#eventsource').val()).ics[0];
            var cp = $($('#wcal').data('popup'));
            var href = $($(cp).data('event')).attr('href');
            var c = $($(cp).data('event')).attr('class').match(/calendar(\d+)/)[1];
            $('[href="'+href+'"]').fadeOut('fast',function (){$(cp).remove();  } );
            $(document).caldav('putEvent',{url:href},ics.PARENT.printiCal (  )); 
            insertEvent(href,ics,c,$('#wcal').data('firstweek'),$('#wcal').data('lastweek'));});
          $('#calpopupe').append(src);
          $('#calpopupe').append(save);
        }
      );
  }
  $('#calpopupe .button').bind ('click keypress',inviteButtonClick);
  
  draggable ( $('#calpopupe') );
  $('#calpopupe').show();
  $('#wcal').data('clicked', e.target);
  $(document).click( $('#wcal').data('edit_click') ); 
  $(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function inviteButtonClick (e) 
{
  if ( e.keyCode > 0 )
    if ( e.keyCode != 32 || e.keyCode != 13 )
      return ;
  var evt = $($('#calpopupe').data('event'));
  var ics = $(evt).data('ics');
  if ( $(evt).data('method') == 'CANCEL' )
  {
    var originalHref = $(evt).attr('href');
    $(document).caldav('delEvent',{url:originalHref});
    var calHome = $.fn.caldav.data.myPrincipal;
    var existing = $('#wcal .event[uid="'+ics.vcalendar[ics.TYPE].uid+'"], #caltodo .event[uid="'+ics.vcalendar[ics.TYPE].uid+'"]').filter('[owner^='+calHome+']' );
    if ( existing.length > 0 && $(existing).parents('#calinvites').length == 0 )
    {
      var href = $(existing).attr('href');
      $(existing).remove();
      $(document).caldav('delEvent',{url:href});
    }
    if ( ! $.fn.caldav.supports['calendar-auto-schedule'] )
    {
      // todo add mailto: link support for servers that don't support scheduling

    }
  }
  else if ( $(evt).data('method') == 'REPLY' )
  {
    var originalHref = $(evt).attr('href');
    $(document).caldav('delEvent',{url:originalHref});
    $('#calinvites [href="'+originalHref+'"]').remove();  
    if ( ! $.fn.caldav.supports['calendar-auto-schedule'] )
    {
      // todo add mailto: link support for servers that don't support scheduling

    }
  }
  else
  {
    var attendees = ics.vcalendar[ics.TYPE]['attendee'];
    if ( typeof attendees != "object" )
    {
      if ( debug )
        console.log('attendee missing from event');
      $(document).unbind('click',$('#wcal').data('edit_click')); 
      $(document).unbind('keydown',$('#wcal').data('edit_keyup')); 
      $('#calpopupe').fadeOut();
      $('#wcal').removeData('popup');
      $('#wcal').removeData('clicked');
      return;
    }
    var partstat;
    if ( $(e.target).text() == ui.accept )
      partstat = 'ACCEPTED';
    if ( $(e.target).text() == ui.maybe )
      partstat = 'TENTATIVE';
    if ( $(e.target).text() == ui.decline )
      partstat = 'DECLINED';
    if ( attendees['VALUES'] == undefined )
      return ;
    var a = attendees.VALUES;
    if ( ics.vcalendar['method'] )
      delete ics.vcalendar['method'];
    var myp = $.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal];
    var addresses = '';
    for ( var i=0; i < a.length; i++ )
    {
      if ( /^mailto:/.test(attendees.VALUES[i]) )
      {
        if ( attendees.PROPS[i]['cn'] )
          addresses = addresses + ', ' + attendees.PROPS[i]['cn'] + ' <' + String(attendees.VALUES[i]).replace( /^mailto:/,'') + '>';
        else
          addresses = addresses + ', ' + String(attendees.VALUES[i]).replace( /^mailto:/,'') ;
      }
      if ( $.fn.caldav.principalMap[a[i]] == myp )
      {
        attendees.PROPS[i]['partstat'] = partstat;
        //console.log ( 'XX YES this is me ' + myp +' => '+ attendees.VALUES[i] , attendees.PROPS[i]['partstat'] );
      }
      //else
        //console.log ( ' not me ' + attendees.VALUES[i] , attendees.PROPS[i]['partstat'] );
    }
    addresses = addresses.replace(/^, /,'');
    if ( debug )
      console.log(partstat,ics.PARENT.printiCal());
    var calHome = $.fn.caldav.data.myPrincipal;
    var existing = $('#wcal .event[uid="'+ics.vcalendar[ics.TYPE].uid+'"], #caltodo .event[uid="'+ics.vcalendar[ics.TYPE].uid+'"]').filter('[owner^="'+calHome+'"]' );
    var originalHref = $(evt).attr('href');
      var mailtext = 'mailto:' + addresses + '?subject=' + ics.vcalendar[ics.TYPE].summary + '&body=' + ics.PARENT.printiCal( );
      console.log( mailtext );
    if ( ! $.fn.caldav.supports['calendar-auto-schedule'] )
    {
      // todo add mailto: link support for servers that don't support scheduling
      var mailtext = 'mailto:' + addresses + '?subject=' + ics.vcalendar[ics.TYPE].summary + '&body=' + ics.PARENT.printiCal( );
      console.log( mailtext );
    }
    else if ( existing.length > 0 )
    {
      var href = $(existing).attr('href');
      var cal = String($(existing).attr('class')).replace(/.*calendar([0-9]+).*/,"$1");
      var outboxHref = $.fn.caldav.outboxMap[$.fn.caldav.data.myPrincipal] + guid() + '.ics';
      //$(existing).data('ics',ics);
      $(existing).remove();
      if ( ics.TYPE == 'vevent' )
        insertEvent(href,ics,cal,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
      if ( ics.TYPE == 'vtodo' )
        insertTodo(href,ics,cal,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
      //$(document).caldav('putNewEvent',{url:outboxHref},ics.PARENT.printiCal()); 
      if ( partstat == 'DECLINED' ) 
      {
        $(document).caldav('delEvent',{url:href,'Schedule-Reply':'F'});
        $(existing).remove();
      }
      else
        $(document).caldav('putEvent',{url:href},ics.PARENT.printiCal()); 
      if ( originalHref.indexOf($.fn.caldav.inboxMap[$.fn.caldav.data.myPrincipal]) > -1 )
      {
        $(document).caldav('delEvent',{url:originalHref,'Schedule-Reply':'F'});
        $(evt).remove();
      }
      else
        $('#invitewrap [uid="'+ics.vcalendar[ics.TYPE].uid+'"]').remove();
    }
    else
    {
      var href = $(evt).attr('href').replace(/^.*\//,'');
      var cal = String($('#callist .selected').attr('class')).replace(/.*calendar([0-9]+).*/,"$1");
      var outboxHref = $.fn.caldav.outboxMap[$.fn.caldav.data.myPrincipal] + href;
      if ( $.fn.caldav.calendarData[cal].principal == $.fn.caldav.data.myPrincipal )
        href = $.fn.caldav.calendarData[cal].href + href;
      else
        href = $.fn.caldav.calendarData[0].href + href;
      // put to outbox
      if ( partstat != 'DECLINED' ) 
        $(document).caldav('putNewEvent',{url:href},ics.PARENT.printiCal()); 
      $(document).caldav('delEvent',{url:originalHref,'Schedule-Reply':'F'});
      if ( ics.TYPE == 'vevent' )
        insertEvent(href,ics,cal,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
      if ( ics.TYPE == 'vtodo' )
        insertTodo(href,ics,cal,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
    }
  }
  $(document).unbind('click',$('#wcal').data('edit_click')); 
  $(document).unbind('keydown',$('#wcal').data('edit_keyup')); 
  $('#calpopupe').fadeOut();
  $('#wcal').removeData('popup');
  $('#wcal').removeData('clicked');
}



function updateIcs ( href, ics , cal )
{   
  var t,cald = $('.jqcaldav:eq(0)').data('ics'+cal); 
  var i = ics.vcalendar;
  if ( typeof cald != "object" )
    cald = {cal:cal,vtimezone:{},vevent:{},vtodo:{},vjournal:{},hrefs:{},uid:{}};
  if ( i.vtimezone != undefined && cald.vtimezone[i.vtimezone.tzid.VALUE] == undefined )
    cald.vtimezone[i.vtimezone.tzid.VALUE] = $.extend(true,{},i.vtimezone);
  if ( i.vevent != undefined && cald.vevent[i.vevent.uid.VALUE+''+i.vevent.sequence!=undefined?i.vevent.sequence.VALUE:''] == undefined )
  { 
    var t = $.extend(true,{},i.vevent);
    cald.vevent[i.vevent.uid.VALUE+''+i.vevent.sequence!=undefined?i.vevent.sequence.VALUE:''] = t;
  }
  if ( i.vtodo != undefined && cald.vtodo[i.vtodo.uid.VALUE+''+i.vtodo.sequence!=undefined?i.vtodo.sequence.VALUE:''] == undefined )
  { 
    var t = $.extend(true,{},i.vtodo);
    cald.vtodo[i.vtodo.uid.VALUE+''+i.vtodo.sequence!=undefined?i.vtodo.sequence.VALUE:''] = t;
  }
  if ( i.vjournal != undefined && cald.vjournal[i.vjournal.uid.VALUE+''+i.vjournal.sequence!=undefined?i.vjournal.sequence.VALUE:''] == undefined )
  {
    var t = $.extend(true,{},i.vjournal);
    cald.vjournal[i.vjournal.uid.VALUE+''+i.vjournal.sequence!=undefined?i.vjournal.sequence.VALUE:''] = t;
  }
  if ( cald.hrefs[href] == undefined )
    cald.hrefs[href] = new Array;
  cald.hrefs[href].push(t);
  if ( cald.uid[t.uid] == undefined )
    cald.uid[t.uid] = new Array;
  cald.uid[t.uid].push(t);
  $('.jqcaldav:eq(0)').data('ics'+cal,cald); 
}

function calDragEnter(event) 
{ 
  var type='';
  if ( event.dataTransfer != undefined )
  {
    if ( event.dataTransfer.dropEffect == 'none' && ! event.altKey )
      event.dataTransfer.dropEffect = 'move'; 
    else if ( event.dataTransfer.dropEffect == 'none' && event.altKey )
      event.dataTransfer.dropEffect = 'copy'; 
    //event.dataTransfer.effectAllowed = 'copyMove'; 
    type = event.dataTransfer.getData('type');
  }
  if ( $('#wcal').has(event.target) && ! $('#caltodo').has(event.target) && ( event.target instanceof HTMLTableCellElement || event.target instanceof HTMLUListElement ) )
  {
    $('.drop').removeClass('drop');
    $('#caldrop').detach().prependTo($(event.target).closest('td'));
    $(event.target).closest('td').addClass('drop');
  }
  else if ( $('#caltodo').has(event.target) ) 
  {
    $(event.target).closest('ul').addClass('drop');
  }
  $('#wcal').addClass('dragging');
  event.preventDefault(); 
  event.stopPropagation();
  return false;
}

function calDragLeave(event) 
{
  event.preventDefault(); 
  event.stopPropagation();
  return false
}

function calDragOver(event) 
{
  var type = '';
  if ( event.dataTransfer != undefined )
  {
    if ( event.dataTransfer.dropEffect == 'none' && ! event.ctrlKey && ! event.altKey )
      event.dataTransfer.dropEffect = 'move'; 
    else if ( event.dataTransfer.dropEffect == 'none' && ( event.ctrlKey || event.altKey ) )
      event.dataTransfer.dropEffect = 'copy'; 
    event.dataTransfer.effectAllowed = 'copyMove'; 
//    if ( event.dataTransfer['getData'] )
//      type = event.dataTransfer.getData('type');
  }
  var e = $(event.target).closest('.drop');
  if ( e.length )
  {
    if ( $('#wcal').data('dragging') != undefined )
    {
      var hide = $($('#wcal').data('dragging')).attr('class').match(/calendar\d+bg/);
      if ( $($('#wcal').data('dragging')).data('duration') == 1 )
        hide = true;
      else
        hide = false;
      var s = $(e).offset();
      if ( $(event.target).parents('#wcal').length > 0 )
      {
        if ( ! hide && ( $('#wcal.weekview').length > 0 || ( event.pageX - s.left ) < ( e[0].clientWidth / 3 ) ) )
        {
          var t = (settings.start.getLongMinutes() + Math.round ( ((settings.end.getLongMinutes()-settings.start.getLongMinutes())/100) * ( (event.pageY - s.top ) / e[0].clientHeight ) ) * 100) / 100;
          var d = new Date();
          d.setUTCMinutes(0);
          d.setUTCHours(t);
          $('#caldrop').text(d.prettyTime());
          $('#caldrop').css('top',(s.top + ((e[0].clientHeight-$('#caldrop')[0].clientHeight) / ((settings.end.getLongMinutes()-settings.start.getLongMinutes())/100) ) * (t-(settings.start.getLongMinutes()/100)) )+'px');
          $('#caldrop').css('left',s.left+e[0].clientWidth/3+'px');
          $('#caldrop').css('width',e[0].clientWidth*2/3+'px');
          $('#caldrop').show();
        }
        else
          $('#caldrop').hide();
      }
      else
        $('#caldrop').hide();
    }
  }
  if ( ! event.target.dragDrop )
  {
    event.preventDefault(); 
    event.stopPropagation();
  }
  return false;
}

function calDrop(e) 
{
    // drop the data
    var hl = $('.highlighted');
    if ( e.otarget == undefined )
      e.otarget = e.currentTarget;
    if ( e.multi !== true && hl.length > 0 && ( e.dataTransfer != undefined || e.originalEvent.dataTransfer != undefined ) )
    {
      e.preventDefault();
      var d1,d2,diff;
      diff = 0;
      if ( $(e.target).parents('#wcal').length > 0 && $($('#wcal').data('dragging')).parents('#wcal').length )
      {
        d1 = (new Date().Zero()).parseDate($($('#wcal').data('dragging')).closest('td').attr('id').match(/day_(\d+)/)[1]);
        d2 = (new Date().Zero()).parseDate($(e.currentTarget).closest('td').attr('id').match(/day_(\d+)/)[1]);
        diff = d2.getTime() - d1.getTime();
      }
      if ( $($('#wcal').data('dragging')).hasClass('highlighted') )
      {
        e.multi = true;
        for ( var i=0; i<hl.length; i++)
        {
          $('#wcal').data('dragging',hl[i]);
          if ( diff != 0 )
          {
            d1 = new Date ((new Date().Zero()).parseDate($(hl[i]).closest('td').attr('id').match(/day_(\d+)/)[1]).getTime() +
              diff ).DayString();
            console.log ( 'adjusting target to ' + d1 );
            e.otarget = $('#day_'+d1)[0];
          }
          console.log('dragging', hl[i]);
          calDrop(e);
        }
      }
      $('.highlighted').toggleClass('.highlighted');
      return;
    }
    e.preventDefault();
    $('#wcal').removeClass('dragging');
    $(e.otarget).closest('td').removeClass('drop');
    var old = $('#wcal').data('dragging');
    e.preventOK = true;
    e.cTarget = e.otarget;
    if ( old != undefined && $(old).data('ics').TYPE == 'vevent' && $(old).data('ics').vcalendar.vevent.rrule != undefined && e.moveAll == undefined )
    {
      $('#wcal').data('drop-question',e);
      questionBox(dropquestion[0],dropquestion[1],
          function(e) {
            var evt = $('#wcal').data('drop-question');
            $('#wcal').removeData('drop-question');
            evt.moveAll = e == 0 ? true : false ;
            calDrop(evt);
          } );
      return false;
    }
    if ($('#caldrop').css('display') == 'none' || $(old).attr('class').match(/calendar\d+bg/) )
      var newtime = undefined ;
    else
      var newtime = (new Date()).parsePrettyTime($('#caldrop').text());
    $('.drop').removeClass('drop');
    $('#caldrop').detach().hide().appendTo('#wcal');
    if ( old != null )
    {
      var sb = $(e.otarget).parents('#callist').length; 
      if ( sb >= 1 )
      {
        $('#wcal').removeData('dragging');
        var src = $(old).attr('href');
        var ics = $(old).data('ics');
        var c = $(e.otarget).closest('li').first().attr('class').match(/calendar(\d+)/)[1];
        if ( ! e.ctrlKey && ! e.altKey )
          $('[href="'+src+'"]').detach();
        var cals = $(document).caldav('calendars');
        var cal  = $(old).attr('class').match (/calendar([0-9]+)\s?/);
        if ( cal[1] != undefined )
        {
          if ( ! e.ctrlKey && ! e.altKey )
          {  // move the event
            if ( debug )
              console.log(' moving ' + src + ' to ' + cals[c].href+src.replace(/^.*\//,'') );
            var params = { url: window.location.protocol + '//' + window.location.hostname + (window.location.port?':'+window.location.port:'')+ src,
              headers:{Destination:cals[c].href+src.replace(/^.*\//,''),Overwrite:'F','Content-type':undefined},
              username:$.fn.caldav.options.username,password:$.fn.caldav.options.password};
            $(document).caldav('moveEvent',params ); 
          }
          else
          {  // copy the event
            if ( debug )
              console.log(' copying ' + src + ' to ' + cals[c].href+src.replace(/^.*\//,'') );
            var params = { url:cals[c].href+src.replace(/^.*\//,''),
              headers:{'If-None-Match':'*'},
              username:$.fn.caldav.options.username,password:$.fn.caldav.options.password};
            $(document).caldav('putNewEvent',params,ics.PARENT.toString() );
          }
          if ( ics.TYPE == 'vevent' )
            insertEvent(cals[c].href+src.replace(/^.*\//,''),ics,c,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
          if ( ics.TYPE == 'vtodo' )
            insertTodo(cals[c].href+src.replace(/^.*\//,''),ics,c,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
        }
      }
      else
      {
        var np = $(e.cTarget).closest('td');
        $('#wcal').removeData('dragging');
        var src = $(old).attr('href');
        var ics = $(old).data('ics');
        var c = $(old).attr('class').match(/calendar(\d+)/)[1];
        var newc = $('#callist li.selected'); 
        newc = $(newc).attr('class').match(/calendar(\d+)/)[1];
        var cals = $(document).caldav('calendars');
        if ( $(np).length == 0 ) 
        {
          if ( c == newc && ( ! e.ctrlKey || ! e.altKey ) )
            return;
          np = $(e.cTarget).closest('#caltodo');
          var nics = new iCal('vtodo').ics[0];
          var ve = nics.vcalendar.vtodo;
          for ( var i in ics.vcalendar[ics.TYPE] )
          {
            if ( ics.PARENT.components[ics.TYPE].required.indexOf(i) > -1 || ics.PARENT.components[ics.TYPE].optional.indexOf(i) > -1 )
            {
              if ( ics.PARENT.components.vtodo.required.indexOf(i) > -1 || ics.PARENT.components.vtodo.optional.indexOf(i) > -1 )
                ve[i] = ics.vcalendar[ics.TYPE][i];
            }
            else
              ve[i] = ics.vcalendar[ics.TYPE][i];
          }
          if ( ics.vcalendar[ics.TYPE].dtend )
            nics.vcalendar.vtodo.due.UPDATE ( ics.vcalendar[ics.TYPE].dtend );
          ve['uid'].VALUE = guid();
          src = cals[newc].url+ve['uid'].VALUE;
          var params = { url:src};
          $(document).caldav('putNewEvent',params,nics.PARENT.toString() ); 
          insertTodo(src,nics,newc,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
        }
        else
        {
          // copy event
          if ( ics.TYPE == 'vevent' )
          {
            var d1 = (new Date()).parseDate($(old).closest('td').attr('id').match(/day_(\d+)/)[1]);
            var d2 = (new Date()).parseDate($(np).closest('td').attr('id').match(/day_(\d+)/)[1]);
            var tdiff = ics.vcalendar.vevent.dtend.DATE.getTime() - ics.vcalendar.vevent.dtstart.DATE.getTime() ; 
            if ( e.ctrlKey || e.altKey )
            {
              var nics = $.extend(true,{},ics);
              var tdiff = d2.getTime() - d1.getTime() ;
              var c = $(old).attr('class').match(/calendar(\d+)/)[1];
              if ( newtime != undefined )
                tdiff += ( newtime.getUTCHours() - (ics.vcalendar.vevent.dtstart.DATE.getUTCHours())) * 3600000;
              ics.vcalendar.vevent.dtstart.ORIGDATE = ics.vcalendar.vevent.dtstart;
              ics.vcalendar.vevent.dtstart.UPDATE ( new Date ( ics.vcalendar.vevent.dtstart.DATE.getTime() + tdiff ) );
              ics.vcalendar.vevent.dtend.UPDATE ( new Date ( ics.vcalendar.vevent.dtend.DATE.getTime() + tdiff ) );
              var nguid = guid()
              ics.vcalendar.vevent.uid.UPDATE ( nguid );
              var nurl = cals[c].href+nguid+'.ics';
              
              
              if ( debug )
                console.log(' copying ' + src + ' to ' + nurl );
              var params = { url:nurl,
                headers:{'If-None-Match':'*'},
                username:$.fn.caldav.options.username,password:$.fn.caldav.options.password};
              $(document).caldav('putNewEvent',params,ics.PARENT.toString() );
              
              insertEvent(nurl,ics,c,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
            }
            else
            { // move event
              if ( e.moveAll === false )
              { // move occurence 
                $(old).detach();
                var nics = $.extend(true,{},ics);
                nics.vcalendar.vevent.dtstamp = (new Date()).DateString ( );
                nics.vcalendar.vevent.sequence.VALUE++;
                var start = d1;
                var expan = ics.vcalendar.vevent.rrule.RECURRENCE.expandRecurrence(ics.vcalendar.vevent.dtstart.VALUE,dateAdd(start,'d',2));
                delete nics.vcalendar.vevent.rrule;
                delete nics.vcalendar.vevent.exdate;
                for ( var i in expan )
                  if ( expan[i] >= start)
                  {
                    var estart = expan[i];
                    break ;
                  }
                nics.vcalendar.vevent['recurrence-id'] = nics.PARENT.newField ('RECURRENCE-ID',estart,nics.vcalendar.vevent.dtstart.PROP); 
                var nstart = new Date ( estart.getTime() + ( d2.getTime() - d1.getTime() ) ); 
                if ( newtime != undefined )
                  nstart.setUTCHours( newtime.getUTCHours() ); 
                var dur = ics.vcalendar.vevent.dtend.DATE.getTime() - ics.vcalendar.vevent.dtstart.DATE.getTime() ; 
                var nend = new Date ( estart.getTime() + dur );
                nics.vcalendar.vevent.dtstart = nics.PARENT.newField ( 'dtstart', nstart, nics.vcalendar.vevent.dtstart.PROP );
                nics.vcalendar.vevent.dtend = nics.PARENT.newField ( 'dtend', nstart, nics.vcalendar.vevent.dtstart.PROP );
                nics.PARENT = ics.PARENT;
                ics.PARENT.push ( nics.vcalendar );
                var params = { url:src};
                $(document).caldav('putEvent',params,ics.PARENT.toString() ); 
                insertEvent(src,nics,c,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
                return ;
              }
              else if ( e.moveAll === true )
              { // move entire series
                $('li[uid="'+ics.vcalendar.vevent.uid.VALUE+'"][original=1][href="'+src+'"]').detach();
                var tdiff = d2.getTime() - d1.getTime() ;
                if ( ics.vcalendar.vevent.rrule.RECURRENCE.UNTIL != undefined )
                  ics.vcalendar.vevent.rrule.RECURRENCE.UNTIL = (new Date()).DateString ( new Date ( (new Date()).parseDate(ics.vcalendar.vevent.rrule.RECURRENCE.UNTIL).getTime() + tdiff ) );
              }
              else
              { // plain move event
                var tdiff = ics.vcalendar.vevent.dtend.DATE.getTime() - ics.vcalendar.vevent.dtstart.DATE.getTime() ; 
                $(old).detach();
                $('li[uid="'+ics.vcalendar.vevent.uid.VALUE+'"][original=1][href="'+src+'"]').detach();
              }
              var tdiff = d2.getTime() - d1.getTime() ;
              if ( newtime != undefined )
                tdiff += ( newtime.getUTCHours() - (ics.vcalendar.vevent.dtstart.DATE.getUTCHours())) * 3600000;
              ics.vcalendar.vevent.dtstart.ORIGDATE = ics.vcalendar.vevent.dtstart;
              ics.vcalendar.vevent.dtstart.UPDATE ( new Date ( ics.vcalendar.vevent.dtstart.DATE.getTime() + tdiff ) );
              ics.vcalendar.vevent.dtend.UPDATE ( new Date ( ics.vcalendar.vevent.dtend.DATE.getTime() + tdiff ) );
              var params = { url:src};
              $(document).caldav('putEvent',params,ics.PARENT.toString() ); 
              insertEvent(src,ics,c,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
            }
          }
          else
          {
            var d1 = (new Date()).parseDate($(np).closest('td').attr('id').match(/day_(\d+)/)[1]);
            if ( newtime != undefined )
            {
              d1.setUTCHours(newtime.getUTCHours());
              d1.setUTCMinutes(newtime.getUTCMinutes());
            }
            var nics = new iCal('vevent').ics[0];
            var ve = nics.vcalendar.vevent;
            for ( var i in ics.vcalendar[ics.TYPE] )
            {
              if ( ics.PARENT.components[ics.TYPE].required.indexOf(i) > -1 || ics.PARENT.components[ics.TYPE].optional.indexOf(i) > -1 )
              {
                if ( ics.PARENT.components.vevent.required.indexOf(i) > -1 || ics.PARENT.components.vevent.optional.indexOf(i) > -1 )
                  ve[i] = ics.vcalendar[ics.TYPE][i];
              }
              else
                ve[i] = ics.vcalendar[ics.TYPE][i];
            }
            nics.vcalendar.vevent.dtstart.UPDATE ( (new Date(d1.getTime())) );
            nics.vcalendar.vevent.dtend.UPDATE ( d1.add('h',1) );
            ve['uid'].VALUE = guid();
            src = String(src).replace ( /(\.[a-zA-Z]*)$/, '-1$1');
            var params = { url:src};
            $(document).caldav('putNewEvent',params,nics.PARENT.toString() ); 
            insertEvent(src,nics,c,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
          }
        }
      }
    }
    else
    {
      // * XXX TODO FIXME clipboard events should work!
      if ( e.dataTransfer != undefined )
        var dt = e.dataTransfer;
      else if ( e.originalEvent.dataTransfer != undefined )
        var dt = e.originalEvent.dataTransfer;
      else
        var dt = { files: undefined };
      $('#wcal').removeData('dragging')
      if ( window.File && window.FileReader && window.FileList && dt.files.length > 0 )
      {
        var sb = $(e.target).parents('#callist').length; 
        var f = dt.files[0];
        var cReader = new FileReader();
        if ( sb >= 1 )
          cReader.calendar = $(e.target).closest('li').first().attr('class').match(/calendar(\d+)/)[1];
        cReader.onload = function (evt) {
            var c = $('#callist li.selected'); 
            if ( evt.target.calendar != undefined )
              c = evt.target.calendar;
            else if ( c.length > 0 )
              c = $(c).attr('class').match(/calendar(\d+)/)[1];
            else 
              c = 0;
            var cals = $(document).caldav('calendars');
            var src  = cals[c].href + guid() ;
            var params = { url:src};
            $(document).caldav('putNewEvent',params,evt.target.result); 
            var ic = new iCal ( String  ( evt.target.result ) );
            insertEvent(src ,ic.ics[0],c,$('#wcal').data('firstweek'),$('#wcal').data('lastweek'));
            };
        cReader.readAsText(f, "UTF-8");
      }
      else
      {
        //console.log(dt.types);
        //console.log(dt.files);
        var data = dt.getData('text/plain');
        var data1 = dt.getData('com.apple.pasteboard.promised-file-url');
        var data2 = dt.getData('Text');
        //console.log(data);
        //var data1 = e.dataTransfer.getData(data);
        //console.log(data1);
        //var ical = parseiCal ( data );
      }
    }
}

function calDragStart(event)
{
  $('#wcal').data('popup',$('#calpopup'));
  $('#calpopup').data('event',event.target);
  if (event.target instanceof HTMLLIElement) {
    var cal = $(event.target).attr('class').match(/calendar(\d+)/)[1];
    var cals = $(document).caldav('calendars');
    if ( cals[cal] == undefined )
    {
      event.preventDefault();
      return false;
    }
    if ( event.dataTransfer['setDragImage'] && typeof event.dataTransfer['setDragImage'] == 'function' )
    {
      if ( $('#wcal').has(event.target).length )
        event.dataTransfer.setDragImage(event.target,($(event.target).width()*(2/3)),1);
      else if ( $('#caltodo').has(event.target).length )
      {
        event.dataTransfer.setDragImage(event.target,($(event.target).width()*(2/3)),1);
        //event.dataTransfer.setDragImage(event.target);
      }
      else
        event.dataTransfer.setDragImage(event.target);
    }
    var ics = $(event.target).data('ics').PARENT.printiCal();
    try {
      event.dataTransfer.setData('text/calendar', ics );
      event.dataTransfer.setData('text/plain', ics );
      event.dataTransfer.setData('Text', ics );
      event.dataTransfer.setData('type', ics.TYPE );
    } catch ( e) {
      event.dataTransfer.setData('Text', ics );
    }
    //if ( cals[cal] != undefined )
    if ( typeof window.btoa == "function" )
      event.dataTransfer.setData('DownloadURL', 'text/calendar:event.ics:data:text/calendar;base64,' + window.btoa(ics) );
      //event.dataTransfer.setData('DownloadURL', 'text/calendar:event.ics:' + $('.jqcaldav:eq(0)').data('caldavurl') + $(event.target).attr('href') );
    $('#wcal').data('dragging', $(event.target));
    $('#wcal').addClass('dragging');
    $('#calpopup').hide();
    if ( $('#calpopupe').length )
      $('#calpopupe').hide();
    if ( cals[cal] != undefined )
      event.dataTransfer.effectAllowed = 'copyMove'; // only allow copy or move
    else
      event.dataTransfer.effectAllowed = 'copy'; // only allow copy on subscribed calendars
    return true;
  } else {
      event.preventDefault(); // don't allow selection to be dragged
  }
}

function calDragEnd(e) 
{
  $('#caldrop').hide();
  $('.drop').removeClass('drop');
  $('#wcal').removeData('dragging');
  $('#wcal').removeClass('dragging');
}

function newevent (e)
{
  $('#calpopupe').remove();
  $('#calpopup').clone(true).attr('id','calpopupe').removeClass('left right bottom').appendTo('#calwrap');
  $('#wcal').data('popup','#calpopupe');
  $('#calpopup').hide();
  $('#calpopupe').hide();
  $('#calpopupe .value').attr('contentEditable',true);
  $('#calpopupe .value').attr('spellcheck','true');
  $(document).click( $('#wcal').data('edit_click') ); 
  $(document).keyup( $('#wcal').data('edit_keyup') ); 

  var pop = $('#calpopupe');
  var c = $('#callist li.selected'); 
  if ( c.length > 0 )
    c = $(c).attr('class').match(/calendar(\d+)/)[1];
  else
    c=0;
  var type;
  var d;
  if ( $(e.target).closest('td').length > 0 )
  {
    var dte = $(e.target).closest('td').attr('id').match(/day_(\d+)/)[1];
    d = (new Date()).parseDate(dte);
    type = 'event';
  }
  else if ( $(e.target).closest('div').attr('id') == 'caltodo' )
  {
    type = 'todo';
  }

  var ics = new iCal('v'+type);
  ics = ics.ics[0];
  ics.vcalendar['v'+type].uid = ics.PARENT.newField('UID',guid());
  $(pop).data('ics',ics);
  $(pop).attr('href', '+&New Event');
  $(pop).empty();
  $(pop).append('<div class="button done" tabindex="0">'+ui.done+'</div>');
  $('.calpopup .done').bind ('click keypress',function (e) {
        if ( e.keyCode > 0 )
          if ( e.keyCode != 32 || e.keyCode != 13 )
            return ;
        if ( eventEdited() == true ) 
        {
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keydown',$('#wcal').data('edit_keyup')); 
        }
      }
      );
  var ul = $('<ul></ul>');
  $(ul).append('<li><span class="label summary" data-field="summary" >'+fieldNames.summary+'</span><span class="value">'+ui[ics.vcalendar['v'+type].summary.VALUE]+'</span></li>');
  if ( type == 'event' ) 
  {
    d.setUTCHours((new Date()).getHours());
    $(ul).append('<li><span class="label ESTART" data-field="from" >'+fieldNames.dtstart+'</span><span class="value">'+d.prettyDate() +'</span></li>');
    d.setUTCHours(d.getUTCHours()+1);
    $(ul).append('<li><span class="label EEND" data-field="to" >'+fieldNames.dtend+'</span><span class="value">'+d.prettyDate() +'</span></li>');
    $(ul).append('<li><span class="label transp" data-field="show as" >'+fieldNames.transp+'</span><span class="value">'+ valueNames.TRANSPARENT +'</span></li>');
    $( '.ESTART ~ .value', ul ).bind ( 'mousewheel DOMMouseScroll', dateScroll );
    $( '.ESTART ~ .value', ul ).addClass ( 'date' );
    $( '.EEND ~ .value', ul ).bind ( 'mousewheel DOMMouseScroll', dateScroll );
    $( '.EEND ~ .value', ul ).addClass ( 'date' );
  }
  else if ( type == 'todo' ) 
  {
  var d = new Date();
    d.setUTCDate((new Date()).getDate()+1);
    $(ul).append('<li><span class="label due" data-field="due" >'+fieldNames.due+'</span><span class="value">'+d.prettyDate() +'</span></li>');
    $( '.due ~ .value', ul ).bind ( 'mousewheel DOMMouseScroll', dateScroll );
    $( '.due ~ .value', ul ).addClass ( 'date' );
  }
  $(pop).append(ul);
  var off = $(e.target).offset();
  var popoff = {width: 300, height: 350 };
  if ( off.left + e.target.offsetWidth + popoff.width > window.innerWidth )
  { $(pop).css({left:(off.left - (popoff.width+17))}); $(pop).removeClass('left').removeClass('right'); }
  else
  { $(pop).css({left:off.left + e.target.offsetWidth});$(pop).removeClass('right').addClass('left'); }
  if ( off.top + popoff.height > window.innerHeight )
  { $(pop).css({top:(off.top-(popoff.height-100))}); $(pop).addClass ('bottom'); }
  else
  { $(pop).css({top: off.top }); $(pop).removeClass('bottom'); }

  $('#calpopupe .value,.evheader').attr('contentEditable',true);
  $('#calpopupe .value').focus(fieldClick);
  $('#calpopupe .evheader').focus();
  $('#calpopupe .value,.evheader').attr('spellcheck','true');
  $('#calpopupe > ul').append('<li><div class="completionWrapper"><div class="completion"></div></div><span class="add button dropdown">'+ui.add+'</span></li>');
  $('#calpopupe .add').click(addField);
  $('#calpopupe').data('event', '#calpopupe' );
  $('#calpopupe').data('ics',ics);
  draggable ( $('#calpopupe') );
  $('#wcal').data('clicked', $(pop));
  $(document).click( $('#wcal').data('edit_click') );
  $(document).keyup( $('#wcal').data('edit_keyup') );
  $('#calpopupe').show();
}

function eventHover (e) 
{
  if ( $('#wcal').data('clicked') == e.target || $('#wcal').data('dragging') != undefined )
    return ;
  var pop = $('#calpopup');
  if ( $('#wcal').data('popup') )
    return ;
  $('#wcal').data('popup','#calpopup');
  $(pop).data('event', e.target);
  var d = $(e.target).data('ics');

  $(pop).empty();
  var ul = $('<ul></ul>').appendTo(pop);
  
  if ( d.vcalendar.vevent != undefined )
  {
    var estart = new Date(d.vcalendar.vevent.dtstart.DATE.getTime());
    var eend, tdiff;
    if ( d.vcalendar.vevent.dtend != undefined )
    {
      eend = new Date(d.vcalendar.vevent.dtend.DATE.getTime());
      tdiff = eend - estart;
    }
    else if ( d.vcalendar.vevent.duration != undefined )
    {
      eend = new Date(estart.getTime());
      eend.addDuration(d.vcalendar.vevent.duration.DURATION);
      tdiff = eend - estart;
    }
    else
    {
      tdiff = 0;
      eend = new Date(estart.getTime());
    }
    if ( d.vcalendar.vevent.rrule != undefined )
    {
      var start = (new Date()).parseDate($(e.target).attr('instance'));
      var expan = d.vcalendar.vevent.rrule.RECURRENCE.expandRecurrence(d.vcalendar.vevent.dtstart.VALUE,dateAdd(start,'d',2));
      var run = new Array ();
      if ( expan != undefined )
      {
        for ( var i in expan )
          if ( expan[i] >= start)
          {
            estart = expan[i];
            break ;
          }
        eend = new Date ( estart.getTime() + tdiff );
      }
    }
    
    var missing= new Array (),type = 'vevent', duration=false;
    var props = [];
    props.push('summary');
    if ( tdiff == 86400000 ) 
      duration = true;
    props.push('ESTART');
    if ( d.vcalendar.vevent.dtend != undefined )
      props.push('EEND');
    else if ( debug )
      console.log ( d.vcalendar.vevent.duration.DURATION );
    for ( var x in d.PARENT.components.vevent.optional){props.push(d.PARENT.components.vevent.optional[x]); }
    if ( d.vcalendar[type].valarm != undefined )
    {
      props.push('valarm');
    }
    d.vcalendar[type]['ESTART'] = d.PARENT.newField('DTSTART',estart);
    d.vcalendar[type]['EEND'] = d.PARENT.newField('DTEND',eend);
  }
  else if ( d.vcalendar.vtodo != undefined )
  { 
    var props = [],type = 'vtodo';
    props.push('summary');
    props.push('due');
    if ( d.vcalendar[type].valarm != undefined )
    {
      props.push('valarm');
    }
    for ( var x in d.PARENT.components.vtodo.required){props.push(d.PARENT.components.vtodo.required[x]); }
    for ( var x in d.PARENT.components.vtodo.optional){props.push(d.PARENT.components.vtodo.optional[x]); }
  }
  if ( /calendarserver-private-comments/.test ( $.fn.caldav.serverSupports ) )
    props.push('x-calendarserver-private-comment');
  if ( /calendarserver-private-events/.test ( $.fn.caldav.serverSupports ) )
    props.push('x-calendarserver-access');
  var used = [];
  var fn;
  for ( var x in props )
  {
    var extra = '';
    fn = props[x];
    switch ( props[x] )
    {
      case 'ESTART':
        var extra = duration?'extra="'+recurrenceUI.on+'"':'';
        var label = fieldNames['dtstart'];
        fn = 'dtstart';
        break;
      case 'EEND':
        var extra = duration?'extra="'+recurrenceUI.until+'"':'';
        var label = fieldNames['dtend'];
        fn = 'dtend';
        break;
      case 'DURATION':
        var label = fieldNames['duration'];
        break;
      case 'rrule':
        if ( d.vcalendar[type][props[x]] && d.vcalendar[type][props[x]].RECURRENCE )
        {
          try {
          used.push(props[x]);
          var li = $('<li><span class="label"  data-field="'+fieldNames.rrule+'">'+fieldNames.rrule+'</span></li>');
          $(li).append(d.vcalendar[type][props[x]].RECURRENCE.editRecurrence());
          $(ul).append(li);
          }catch (e){console.log('error printing recurrence');}
        }
        continue;
      case 'valarm':
        used.push(props[x]);
        var li = $('<li><span class="label alarm"  data-field="'+ui.alarm+'">'+ui.alarm+'</span></li>');
        $(li).append(printAlarm(d.vcalendar[type][props[x]]));
        $(ul).append(li);
        continue;
      case 'attendee':
        if ( d.vcalendar[type][props[x]] )
        {
          used.push(props[x]);
          var li = $('<li><span class="label '+props[x]+'"  data-field="'+fieldNames[props[x]]+'">'+fieldNames[props[x]]+'</span></li>');
          $(li).append(printAttendee(d.vcalendar[type][props[x]]));
          $(ul).append(li);
        }
        continue;
      default:
        if ( used.indexOf(props[x]) != -1 )
          continue;
        if ( props[x] == 'dtend' && x != 'to' && x != 'until' )
          continue;
        if ( ! d.PARENT.fields[props[x]] && props[x] != 'summary' )
          continue;
        else if ( ! d.PARENT.fields[props[x]].visible )
          continue;
        var label = fieldNames[props[x]];
        used.push(props[x]);
    }
    if ( d.vcalendar[type][props[x]] )
    {
      try {
        var text = String(d.vcalendar[type][props[x]]);
      }catch (e){
        var text = '';
        console.log('error printing '+ props[x]);}
      if ( d.vcalendar[type][props[x]].length > 1 )
      { // this should probably be in a loop
        var li = $( '<li><span class="label ' + props[x]+'" data-field="'+label+'" ' + extra+' >' + label + '</span><span class="value"></span></li>' );
        $( '.value', li ).text ( text );
        $( '.value', li ).attr ('data-value', text );
      }
      else
      {
        var li = $( '<li><span class="label '+props[x]+'" data-field="'+label+'" '+extra+' >'+label+'</span><span class="value"></span></li>' );
        $( '.value', li ).append ( expandText ( text ) );
        $( '.value', li ).attr ( 'data-value', text );
      }
      if ( d.PARENT.fields[fn].type == 'date' )
      {
        $( '.value', li ).bind ( 'mousewheel DOMMouseScroll', dateScroll );
      }
      $( '.value', li ).addClass ( d.PARENT.fields[fn].type );
      if ( props[x] == 'url' )
        urlHover ( li );
      $(ul).append(li);
    }
    //else if ( props[x] == 'summary' )
    //  $(ul).append('<li><span class="label '+props[x]+'" '+extra+' >'+label+'</span><span class="value" data-value="" ></span></li>');
  }
  var off = $(e.target).offset();
  var popoff = {width: 300, height: 350 };
  if ( off.left + e.target.offsetWidth + popoff.width > window.innerWidth )
  { $(pop).css({left:(off.left - (popoff.width+30))}); $(pop).removeClass('left').addClass('right'); }
  else
  { $(pop).css({left:off.left + e.target.offsetWidth+9});$(pop).removeClass('right').addClass('left'); }
  if ( off.top + popoff.height - 40 > window.innerHeight )
  { $(pop).css({top:(off.top-(popoff.height-100))}); $(pop).addClass ('bottom'); }
  else
  { $(pop).css({top: off.top }); $(pop).removeClass('bottom'); }
  $(pop).show();
}

function eventMouseout()
{
  $('#calpopup').hide();
  if ( $('#wcal').data('popup') == '#calpopup') 
    $('#wcal').removeData('popup');
}

function eventClick(e)
{
  if ( e.shiftKey )
  {
    var hl = $('.highlighted');
    if ( hl.length > 0 )
    {
      if ( $(hl[0]).parents('#caltodo').length > 0 && $(e.target).parents('#caltodo').length == 0 )
        $('.highlighted').toggleClass('highlighted');
      if ( $(hl[0]).parents('#wcal').length > 0 && $(e.target).parents('#wcal').length == 0 )
        $('.highlighted').toggleClass('highlighted');
    }
    $(e.target).toggleClass('highlighted');
    return;
  }
  $('#calpopupe').remove();
  $('#wcal').removeData('popup');
  e.stopPropagation();
  if ( $('#wcal').data('dragging') != undefined )
    $('#wcal').removeData('dragging')
  eventHover(e);
  var cp = $($('#wcal').data('popup'));
  var href = $($(cp).data('event')).attr('href');
  var cals = $(document).caldav('calendars');
  var c = $($(cp).data('event')).attr('class').match(/calendar(\d+)/)[1];
  var d = $($(cp).data('event')).data('ics');
  var ok = true;
  if ( cals[c] != undefined && /(^| )2,/.test ( $.fn.caldav.serverSupports ) )
    ok = $(document).caldav('lock',href,600,
        function(k)
        {
          if (k!==true ) $('#calpopupe .done,#calpopupe .delete').addClass('warning'); 
        });
  $('#calpopup').clone(true).attr('id','calpopupe').removeClass('left right bottom').appendTo('#calwrap');
  $('#wcal').data('popup','#calpopupe');
  $('#calpopupe').data('overflow',0);
  $('#calpopup').hide();
  var lh = $('#calpopupe').innerHeight() - $('#calpopupe').height();
  if ( $('#calpopupe > ul').outerHeight()  + lh * 1.5 + 10 > $('#calpopupe').height() )
    $('#calpopupe').height($('#calpopupe > ul').outerHeight()  + lh * 1.5 + 10);
  $('#calpopupe').data('fields',fieldNames);
  $('#calpopupe').css('opacity',1);
  if ( cals[c] != undefined ) 
  {
    $('#calpopupe > ul').append('<li><div class="completionWrapper"><div class="completion"></div></div><span class="add button dropdown">'+ui.add+'</span></li>');
    $('#calpopupe .value').focus(fieldClick);
    $('#calpopupe .add').click(addField);

    $('#calpopupe').append('<div class="button delete" tabindex="0">'+ui['delete']+'</div>');
    $('#calpopupe').append('<div class="button done" tabindex="0">'+ui.done+'</div>');
    if ( d.vcalendar[d.TYPE].attendee  && ( cals[c].principal == $.fn.caldav.data.myPrincipal || cals[c].perms['all'] || cals[c].perms['schedule-send'] || cals[c].perms['schedule-send-reply']) )
    {
      var myemail = $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email;
      if ( 'mailto:' + myemail != d.vcalendar[d.TYPE].organizer.VALUE )
      {
        var mystatus = String($('#calpopupe .attendee.me').data('partstat')).toLowerCase();
        $('#calpopupe').append('<div class="smallschedulebuttons group '+mystatus+'"><div class="button accept" tabindex="0">'+ui.accept+'</div><div class="button maybe" tabindex="0">'+ui.maybe+'</div><div class="button decline" tabindex="0">'+ui.decline+'</div></div>');
        $('#calpopupe .smallschedulebuttons .button').bind('click keypress', inviteButtonClick );
      }
    }
    if ( debug ) 
    {
      $('#calpopupe').append('<div class="button tweak" style="position:absolute;bottom:5px;left:70px; width:40px;" tabindex="0">tweak</div>'); // for debugging, not translated
      $('#calpopupe .tweak').bind ('click',
          function (e)
          {
            var cp = $($('#wcal').data('popup'));
            var cal = cals[c];
            var src  = $('<textarea id="eventsource" style="position:absolute;top:0;left:0;background:grey; overflow-y: auto; white-space: pre;" cols="80" rows="30" contenteditable="true" ></textarea>');
            var save = $('<div id="eventsave" style="position:absolute;bottom:25px;left:70px; width:40px;" class="button">save</div>');
            var d = $($(cp).data('event')).data('ics');
            $(src).text(d.PARENT.printiCal());
            $(save).click(function(e){
              var ics = new iCal ( $('#eventsource').val()).ics[0];
              var cp = $($('#wcal').data('popup'));
              var href = $($(cp).data('event')).attr('href');
              var c = $($(cp).data('event')).attr('class').match(/calendar(\d+)/)[1];
              $('[href="'+href+'"]').fadeOut('fast',function (){$(cp).remove();  } );
              $(document).caldav('putEvent',{url:href},ics.PARENT.printiCal (  )); 
              insertEvent(href,ics,c,$('#wcal').data('firstweek'),$('#wcal').data('lastweek'));});
            $('#calpopupe').append(src);
            $('#calpopupe').append(save);
          }
        );
    }
    $('#calpopupe .done').bind ('click keypress',function (e) {
        if ( e.keyCode > 0 )
          if ( e.keyCode != 32 || e.keyCode != 13 )
            return ;
        if ( eventEdited() == true ) 
        {
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keydown',$('#wcal').data('edit_keyup')); 
        }
      }
      );
    $('#calpopupe .delete').bind ('click keypress',function (e) {
        if ( e.keyCode > 0 )
          if ( e.keyCode != 32 || e.keyCode != 13 )
            return ;
        var t = $($('#calpopupe').data('event'));
        var c = $(t).attr('class').match(/calendar(\d+)/)[1];
        var src = $(t).attr('href');
        var cals = $(document).caldav('calendars');
        eventDeleted(e);  
        $(document).unbind('click',$('#wcal').data('edit_click')); 
        $(document).unbind('keydown',$('#wcal').data('edit_keyup')); 
        $('#calpopupe').hide();
        $('#calpopupe').remove();
        $('#wcal').removeData('clicked');
      }
      );
    $('#calpopupe .value,.evheader,#calpopupe .action,#calpopupe .length').attr('contentEditable',true);
    $('#calpopupe .value,.evheader').attr('spellcheck','true');
    $('#calpopupe .value:first').focus();
  }
  draggable ( $('#calpopupe') );
  $('#calpopupe').show();
  $('#wcal').data('clicked', e.target);
  $(document).click( $('#wcal').data('edit_click') ); 
  $(document).keyup( $('#wcal').data('edit_keyup') ); 
  //return false;
}

function urlHover ( el )
{
  $(el).hover ( 
            function ( e ) 
            { 
              if ( $('.value',e.target).text().match(/^https?:\/\/.+/) ) 
              { 
                $('a',e.target).remove() 
                $('.value',e.target).after( '<a href="'+encodeURI($('.value',e.target).text()) +'" class="link" target="_newtab">'+(ui.open?ui.open:'open')+'</a>'); 
                e.stopPropagation();
                return true;
              } 
            }, 
            function ( e ) 
            {
              $('a',e.target).remove() 
            } );
}

function expandText ( t )
{
  return '<p>' + String ( t ).split ( "\n" ).join ( '</p><p>' ) + '</p>';
}

function unexpandText ( ele )
{
  var txt = ''
  if ( $('p',ele).length > 0 )
    $('p',ele).each(function(i,e){txt += $(e).text() + "\n"});
  else
    txt = $(ele).text();
  return txt;
}

function buildOptions ( opt )
{
  // opt = { 'target':target, 'options':options, 'text':text, 'none':none, 'spaceSelects':spaceSelects, 'search':search, 'removeOnEscape':removeOnEscape, callback };
  //  target == target element for completeion, options == array of options, text == array to print option values from defaults to valueNames
  //  none == whether or not to print the empty value "none", spaceSelects, search, removeOnEscape all passed to keyboardSelectotr
  var s = { 'target': undefined, 'options': undefined, 'text': valueNames, 'none': true, 'spaceSelects': true, 'search': false, 'removeOnEscape': true, 'multiselect': false, callback: undefined };
  for ( var i in s )
    if ( typeof ( opt[i] ) != "undefined" )
      s[i] = opt[i];
  var currentValue = $(s.target).text();
  var innerclass = 'completion';
  if ( s.multiselect !== false )
  {
    var sep = new RegExp ( "\\s*"+s.multiselect+"\\s*" );
    var currentValues = String($.trim(currentValue)).split(sep);
    innerclass = innerclass + ' multiselect';
  }
  var txt = '<div class="completionWrapper"><div class="'+innerclass+'">';
  if ( s.none !== false )
    txt = txt + '<div class="remove" text="'+valueNames['NONE']+'"></div>';
  var text = s.text;
  if ( s.multiselect === false )
  {
    for ( var j = 0; j < s.options.length; j++ )
      txt = txt + '<div'+ (text[s.options[j]]==currentValue?' class="selected" ':'') +'>'+text[s.options[j]]+'</div>';
  }
  else
  {
    for ( var j = 0; j < s.options.length; j++ )
      txt = txt + '<div'+ (currentValues.indexOf(text[s.options[j]])>-1?' class="selected" ':'') +'>'+text[s.options[j]]+'</div>';
  }
  txt = txt + '</div></div>';
  var comp = $(txt);

  $(comp).children().click(function(evt){
    if ( s.multiselect !== false )
    {
      if ( $(evt.target).hasClass('remove') )
      {
        $(evt.target).parent().children().removeClass('selected');
        $(evt.target).parent().parent().next().text('');
      }
      else
      {
        $(evt.target).toggleClass('selected');
        var selected = [];
        $(evt.target).parent().children().each(function(i){if ($(this).hasClass('selected') )selected.push($(this).text());});
        $(evt.target).parent().parent().next().text(selected.join(s.multiselect));
      }
      if ( typeof s.callback == 'function' )
        s.callback ( $(evt.target).parent().parent().next() );
      return true;
    }
    else
    {
      $(evt.target).parent().parent().next().text($(evt.target).text());
      if ( s.multiselect === false )
        $(evt.target).parent().parent().fadeOut(function(){$(this).remove();popupOverflowAuto();$(evt.target).parent().parent().next().unbind('blur keydown');});
      if ( typeof s.callback == 'function' )
        s.callback ( $(evt.target).parent().parent().next() );
      return false;
    }
  });
  $(s.target).bind('keydown',function (e2){ 
    e2.spaceSelects = s.spaceSelects; 
    e2.search = s.search; 
    e2.removeOnEscape = s.removeOnEscape; 
    var k = keyboardSelector(e2);
    if ( k == 'cancel' )
    {
      $(this).prev().fadeOut(function(){$(this).remove();popupOverflowAuto(); $(this).unbind('blur keydown');});
      $('#wcal').data('eatCancel',true);
      e2.stopPropagation();
      return false;
    }
    else if ( $(k).length == 1 )
    {
      if ( s.multiselect === false )
      {
        $(this).text($(k).text());
        $(this).prev().fadeOut(function(){$(this).remove();popupOverflowAuto(); $(this).unbind('blur keydown');});
      }
      else
      {
        if ( $(k).hasClass('remove') )
        {
          $(k).parent().children().removeClass('selected');
          $(k).parent().parent().next().text('');
        }
        else
        {
          $(k).toggleClass('selected');
          var selected = [];
          $(k).parent().children().each(function(i){if ($(this).hasClass('selected') )selected.push($(this).text());});
          $(k).parent().parent().next().text(selected.join(s.multiselect));
        }
      }
      if ( typeof s.callback == 'function' )
        s.callback ( $(evt.target).parent().parent().next() );
      var ret = e2.which==9;  
      return ret;
    } 
    else
      return k;
    },false);
  $(comp).css({top:$(s.target).position().top,left:$(s.target).position().left,'margin-left':'2em'});
  // TODO fix the blur handler so that multiselects don't disapear if the event was inside the completionWrapper
  $(s.target).bind('blur',function(evt){$(evt.target).prev().fadeOut(function(){$(this).remove();popupOverflowAuto();});$(this).unbind('blur keydown');});
  return comp;
}

function fieldClick(e)
{
  var cp = $($('#wcal').data('popup'));
  var d = $($(cp).data('event')).data('ics');
  var label = $(e.target).prev().text();
  for ( var i in fieldNames )
    if ( fieldNames[i] == label )
      break;
  if ( d.PARENT.fields[i] && d.PARENT.fields[i].values && d.PARENT.fields[i].values[d.TYPE] && d.PARENT.fields[i].values[d.TYPE].length> 0 )
  {
    var comp = buildOptions({target:e.target,options:d.PARENT.fields[i].values[d.TYPE]});
    popupOverflowVisi();
    $(e.target).before(comp);
  }
}

function addField(e)
{
  if ( $(this).prev().children('.completion').children().length > 0 ) 
  {
    $(this).prev().children('.completion').empty();
    return;
  }
  $(e.target).focus();
  var off = $(e.target).position();
  $(e.target).prev().css({top:off.top-$(e.target).height()*10,left:off.left+$(e.target).outerWidth()});
  var cp = $($('#wcal').data('popup'));
  var c = $($(cp).data('event')).attr('class');
  var d = $($(cp).data('event')).data('ics');
  var cF = $('.label',cp);
  var currentFields=[];
  var fieldsLUT = {};
  for ( var i in fieldNames )
  {
    fieldsLUT[fieldNames[i]] = i;
    var labels = $('.label:contains('+ fieldNames[i] +')',cp);
    for ( var j=0;j<labels.length;j++ )
      if ( $(labels[j]).text() == fieldNames[i] )
        currentFields.push(i);
  }
  var type = d.TYPE.toLowerCase();
  var allfields = $.extend(true,{},d.PARENT.fields);
  allfields.valarm={max:-1,visible:true};
  var possibleFields = d.PARENT.components[type].optional.slice();
  possibleFields.push('valarm');
  if ( /calendarserver-private-comments/.test ( $.fn.caldav.serverSupports ) )
    possibleFields.push('x-calendarserver-private-comment');
  if ( /calendarserver-private-events/.test ( $.fn.caldav.serverSupports ) )
    possibleFields.push('x-calendarserver-access');
  var showFields = [];
  for ( var j in possibleFields )
  {
    var i = possibleFields[j];
    if ( ! allfields[i].visible )
      continue ;
    if ( allfields[i].max == -1 )
      showFields.push(i);
    if ( allfields[i].max == 1 && currentFields.indexOf(i) == -1 )
      showFields.push(i);
  }
  if ( showFields.length < 1 )
    return;
  $(cp).css({overflow:'visible'});
  showFields.sort(function(a,b){if(fieldNames[a]>fieldNames[b]) return 1; if(fieldNames[a]<fieldNames[b]) return -1; return 0;});
  var txt = '';
  for ( var i = 0; i < showFields.length; i++ )
    txt = txt + '<div data-field="'+showFields[i]+'" >'+fieldNames[showFields[i]]+'</div>';
  $(this).prev().children('.completion').append(txt);
  $(this).prev().children('.completion').children().click(function(e)
    {
      var txt = $('<li><span class="label" data-field="'+$(this).text()+'">'+$(this).text()+'</span><span class="value" contenteditable="true" spellcheck="true"></span></li>');
      if ( $(this).text() == ui.alarm )
      {
        var plus = $('<span><span class="alarm"><span class="action" contenteditable="true">'+valueNames.AUDIO+'</span><span class="value" contenteditable="true">15</span><span class="length" contenteditable="true" >'+durations['minutes before']+'</span><span class="related" contenteditable="true" >'+valueNames.START+'</span></span></span>').append($('<span class="plus">'+ui.add+'</span>').click(function(){$(this).before('<span class="alarm"><span class="action" contenteditable="true">'+valueNames.AUDIO+'</span><span class="value" contenteditable="true">15</span><span class="length" contenteditable="true" >'+durations['minutes before']+'</span><span class="related" contenteditable="true" >'+valueNames.START+'</span></span>');$('.action,.length,.related',$(this).prev()).bind('click, focus',alarmFieldClick);}));
        $('.value',txt).replaceWith(plus);
        $('.action,.length,.related',txt).bind('click, focus',alarmFieldClick);
        var cp = $(this).closest('li').before(txt);
      }
      else if ( $(this).text() == fieldNames.organizer )
      {
        var val = ($.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email?
          'mailto:'+$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email:
          $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].href);
        var txt = $('<li><span class="label" data-field="'+fieldNames.organizer+'" >'+fieldNames.organizer+'</span><span class="value" contenteditable="true" data-cn="'+
          $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name+'" data-value="'+
          val+'" spellcheck="true">'+$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name+'</span></li>');
        var cp = $(this).closest('li').before(txt);
      }
      else if ( $(this).text() == fieldNames.attendee )
      {
        var val = ($.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email?
          'mailto:'+$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email:
          $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].href);
        var txt = $('<li><span class="label" data-field="'+fieldNames.organizer+'" >'+fieldNames.organizer+'</span><span class="value" contenteditable="true" data-cn="'+
          $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name+'" data-value="'+val
          +'" spellcheck="true">'+$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name+'</span></li>');
        var cp = $(this).closest('li').before(txt);
        var txt = $('<li><span class="label" data-field="'+fieldNames.attendee+'" >'+$(this).text()+'</span><span class="value" contenteditable="true" spellcheck="true"></span></li>');
        $('.value',txt).replaceWith(printAttendee());
        var cp = $(this).closest('li').before(txt);
      }
      else if ( $(this).text() == fieldNames.rrule )
      {
        var nr = recurrence ('FREQ=YEARLY');
        $('.value',txt).replaceWith(nr.editRecurrence());
        var cp = $(this).closest('li').before(txt);
      }
      else
      {
        $('.value',txt).focus(fieldClick);
        if ( iCal().fields[fieldsLUT[ $(this).text()]].type == 'date' )
          $('.value',txt).bind('mousewheel DOMMouseScroll',dateScroll);
        var cp = $(this).closest('li').before(txt);
        $(cp).prev().children('.value').focus();
      }
      $(e.target).parent().empty();
      popupOverflowAuto();
      return false;
    });
  $(e.target).keydown(function (e2){ 
      e2.spaceSelects = true; 
      e2.search = false; 
      var k = keyboardSelector(e2);
      if ( k == 'cancel' )
      {
        $(e.target).prev().empty();
        popupOverflowAuto();
        return false;
      }
      if ( $(k).length == 1 )
      {
        var txt = $('<li><span class="label">'+$(k).text()+'</span><span class="value" contenteditable="true" spellcheck="true"></span></li>');
        if ( $(this).text() == ui.alarm )
        {
          var plus = $('<span></span>').append($('<span class="plus">'+ui.add+'</span>').click(function(){$(this).before('<span class="alarm"><span class="action" contenteditable="true">'+valueNames.AUDIO+'</span><span class="value" contenteditable="true">15</span><span class="length" contenteditable="true" >'+durations['minutes before']+'</span><span class="related" contenteditable="true" >'+valueNames.START+'</span></span>');}));
          $('.value',txt).replaceWith(plus);
          $('.value',txt).bind('mousewheel DOMMouseScroll',dateScroll);
          var cp = $(this).closest('li').before(txt);
          $('.action,.length,.related',cp).bind('click, focus',alarmFieldClick);
        }
        else if ( $(this).text() == fieldNames.organizer )
        {
          var val = ($.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email?
            'mailto:'+$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email:
            $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].href);
          var txt = $('<li><span class="label" data-field="'+fieldNames.organizer+'" >'+fieldNames.organizer+'</span><span class="value" contenteditable="true" data-cn="'+
            $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name+'" data-value="'+
            val+'" spellcheck="true">'+$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name+'</span></li>');
          var cp = $(this).closest('li').before(txt);
        }
        else if ( $(this).text() == fieldNames.attendee )
        {
          var val = ($.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email?
            'mailto:'+$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email:
            $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].href);
          var txt = $('<li><span class="label" data-field="'+fieldNames.organizer+'" >'+fieldNames.organizer+'</span><span class="value" contenteditable="true" data-cn="'+
            $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name+'" data-value="'+val
            +'" spellcheck="true">'+$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name+'</span></li>');
          var cp = $(this).closest('li').before(txt);
          var txt = $('<li><span class="label" data-field="'+fieldNames.attendee+'" >'+$(this).text()+'</span><span class="value" contenteditable="true" spellcheck="true"></span></li>');
          $('.value',txt).replaceWith(printAttendee());
          var cp = $(this).closest('li').before(txt);
        }
        else if ( $(this).text() == fieldNames.rrule )
        {
          var nr = recurrence ('FREQ=YEARLY');
          $('.value',txt).replaceWith(nr.editRecurrence());
        }
        else
        {
          $('.value',txt).focus(fieldClick);
          if ( iCal().fields[fieldsLUT[ $(this).text()]].type == 'date' )
            $('.value',txt).bind('mousewheel DOMMouseScroll',dateScroll);
          var cp = $(this).closest('li').before(txt);
          $(cp).prev().children('.value').focus();
        }
        $(k).parent().empty();
        popupOverflowAuto();
        return false;
      }
      else
        return k;
      });
}

function printAttendee(a)
{
  var ret  = $('<span class="value"><span>');
  var atts=[],props=[];
  if ( a == undefined )
  {
    atts.push('mailto:'+$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email);
    props.push({partstat:'ACCEPTED',cn:$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name,rsvp:'FALSE',
      email:$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email});
  }
  else if ( ! a.VALUES )
  {
    atts.push(a.VALUE);
    props.push(a.PROP);
  }
  else
  {
    atts =a.VALUES;
    props = a.PROPS;
  }
  for ( var i=0; i < atts.length; i++ )
  {
    if (props[i] != undefined )
      $(ret).append('<span class="value attendee '+ String(props[i]['partstat']+'').toLowerCase() +'" title="'+String(props[i]['email']?props[i]['email']:atts[i].replace(/^mailto:/i,'')+'')+'" data-value="'+atts[i]+'" data-original="'+atts[i]+'" data-cn="'+String(props[i]['cn']+'')+'" data-email="'+String(props[i]['email']+'')+'" data-partstat="'+String(props[i]['partstat']+'')+'" data-schedstatus="'+String(props[i]['schedule-status']+'')+'" data-rsvp="'+String(props[i]['rsvp']+'')+'" contenteditable="true" >'+(props[i]['cn']?props[i]['cn']:atts[i].replace(/^mailto:/i,'')).replace(/^"(.*)"$/,"$1")+'</span>');  
  }
  $('[data-email="'+ $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email +'"]',ret).addClass('me');
  var plus = $('<span class="plus">'+ui.add+'</span>').click(function(){ var n = $('<span class="value attendee needs-action" contenteditable="true" ></span>');$(n).bind('keydown',completePrincipal);$(this).before(n);$(this).prev().focus();});
  var freebusy = $('<span class="plus">'+ui.available+'</span>').click(
      function(e)
      {
        var n = $('<div id="scheduling" ><span id="resolve" class="button">'+ui.resolve+'</span><span class="close button">'+ui.done+'</span><ul id="schedusers"></ul><ul id="schedtime"></ul></div>');
        $('.close',n).click(function(e){$('#scheduling').remove();return false;});
        var vcs = $($('#calpopupe').data('event')).data('ics');
        var attendee;
        var atts = $(e.target).parent().children('.attendee');
        for ( var i=0; i < atts.length; i++ )
        {
          //var u = (props[i]['cn']?props[i]['cn']:atts[i].replace(/^mailto:/i,'')).replace(/^"(.*)"$/,"$1");
          var u = $.trim($(atts[i]).text());
          if ( u != '' && $.trim($(atts[i]).data('email')) != '' )
          {
            $('#schedusers',n).append('<li class="suser'+i+'" user="'+u+'">'+u+'</li>');
            var user;
            //if ( $.trim($(atts[i]).data('value')) != '' )
            //  user =$.trim($(atts[i]).data('value'));
            //else
              user = 'mailto:'+$.trim($(atts[i]).data('email')).replace(/^mailto:/i,'').replace(/^"(.*)"$/,"$1");
            if ( attendee == undefined )
              attendee = vcs.PARENT.newField('attendee',user,{cn:u});
            else
              attendee.UPDATE(user,{cn:u});
          }
        }
        var start = Zero().parsePrettyDate($('#calpopupe .ESTART + .value').text()).add('h',-7);
        var begin = new Date(start.getTime());
        var end = new Date(start.getTime());
        end = end.add('h',102);
        var hrs ='';
        var vector = [];
        for ( var i=0; i < 96; i++,start.add('h',1) )
        {
          hrs = hrs + '<li class="sday'+start.getUTCDate()+' shour'+start.getUTCHours()+'" data-month="'+months[start.getUTCMonth()]+'" data-date="'+start.getUTCDate()+'" data-hour="'+start.getUTCHours()+'" data-time="'+start.DateString()+'"></li>';
          for ( var j=i*4; j < (i+1)*4; j++ )
            vector[j] = 0;
        }
        $('#schedtime',n).append(hrs);
        $('#schedtime',n).data('begin',begin);
        $('#schedtime',n).data('vector',vector);

        $('#resolve',n).click(function(e)
            {
              var vector = $('#schedtime',n).data('vector');
              var begin  = $('#schedtime',n).data('begin');
              var start  = Zero().parsePrettyDate($('#calpopupe .ESTART + .value').text());
              var end    = Zero().parsePrettyDate($('#calpopupe .EEND + .value').text());
              var s = parseInt(((start - begin)/60000)/15);
              var l = parseInt(((end - start)/60000)/15);
              for ( var i = s; i < vector.length - l; i++ )
              {
                if ( vector.slice(i,i+l).indexOf(1) == -1 )
                  break;
              }
              if ( i < vector.length - l )
              {
                var ns = new Date (start.getTime () + (( i-s ) * 15 * 60000));
                var li = $('#schedtime li.sday'+ns.getUTCDate()+'.shour'+ns.getUTCHours());
                $('#schedtime .sched').detach().appendTo(li);
                $('#schedtime .sched').removeClass('start0 start1 start2 start3');
                if ( i%4 != 0 )
                  $('#schedtime .sched').addClass('start'+(i%4));
                var ne = new Date ( ns.getTime() + ( end.getTime() - start.getTime() ));
                console.log(begin,end,ne);
                $('#calpopupe .ESTART + .value').text(ns.prettyDate());
                $('#calpopupe .EEND + .value').text(ne.prettyDate());
                $('#schedtime .sched').removeClass('conflict');
              }
            });
        $('#schedtime li',n).click(function(e)
            {
              if ( e.currentTarget.nodeName != 'LI' )
                return ;
              var es = Zero().parsePrettyDate($('#calpopupe .ESTART + .value').text());
              var ee = Zero().parsePrettyDate($('#calpopupe .EEND + .value').text());
              var li = $(e.currentTarget);
              var clickedOffset = Math.round(e.offsetX/$(e.currentTarget).innerWidth()*3);
              for ( var i=0; i<parseInt(clickedOffset/4); i++ )
                li = $(li).next();
              var offset = Math.round((new Date(es)).getUTCMinutes()/15);
              if ( clickedOffset != offset && $('#schedtime').data('exactpositioning') )
              {
                es.setUTCMinutes(15*clickedOffset%4);
                offset = clickedOffset;
              }
              var nt = Zero().parseDate($(li).data('time'));
              var diff = nt.getTime() - es.getTime();
              console.log(begin,end,diff,clickedOffset);
              $('#calpopupe .ESTART + .value').text((new Date(es.getTime() + diff)).prettyDate());
              $('#calpopupe .EEND + .value').text((new Date(ee.getTime() + diff)).prettyDate());
              $('#schedtime .sched').detach().appendTo(li);
              $('#schedtime .sched').removeClass('start0 start1 start2 start3');
              var times = $('#schedtime').data('fb');
              es = es.getTime()+diff;
              ee = ee.getTime()+diff;
              $('#schedtime .sched').addClass(offset);
              $('#schedtime .sched').removeClass('conflict');
              for ( var i=0; i < times.length; i++ )
              {
                if ( ( times[i].start >= es && times[i].end <= es ) || ( times[i].start >= ee && times[i].end <= ee ) ||
                  ( times[i].start >= es && times[i].end <= ee ) || ( times[i].start <= es && times[i].end >= ee ) )
                  $('#schedtime .sched').addClass('conflict');
              }
            });
        var es = Zero().parsePrettyDate($('#calpopupe .ESTART + .value').text());
        var ee = Zero().parsePrettyDate($('#calpopupe .EEND + .value').text());
        len  = parseInt(((ee.getTime()-es.getTime())*4)/3600000)/4;
        var offset = 'start' + Math.round(es.getUTCMinutes()/15);
        $('#schedtime li.sday'+es.getUTCDate()+'.shour'+es.getUTCHours(),n).append('<span class="sched '+offset+'" data-hours="'+len+'"></span>');
        var ic = new iCal(vcs.PARENT.icsTemplateVfreebusy);
        var c = ic.ics[0];
        c.vcalendar.vfreebusy.uid      = ic.newField('uid',guid());
        c.vcalendar.vfreebusy.dtstamp.UPDATE((new Date()));
        c.vcalendar.vfreebusy.dtstart.UPDATE(begin);
        c.vcalendar.vfreebusy.dtend.UPDATE(end);
        c.vcalendar.vfreebusy.organizer = ic.newField('organizer',$.fn.caldav.data.myPrincipal,{cn:$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].name});
        c.vcalendar.vfreebusy.attendee = attendee;
        var txt = String(ic);
        $.POST({url:$.fn.caldav.outboxMap[$.fn.caldav.data.myPrincipal],data:txt,username:$.fn.caldav.options.username,password:$.fn.caldav.options.password,
          contentType:'text/calendar',
          complete: function(r,s)
          {
            $.ajaxSetup.headers = {};
            if ( s == "success" )
            {
              var responses = $('response',r.responseXML);
              var vcs = $($('#calpopupe').data('event')).data('ics');
              var es = Zero().parsePrettyDate($('#calpopupe .ESTART + .value').text()).getTime();
              var ee = Zero().parsePrettyDate($('#calpopupe .EEND + .value').text()).getTime();
              var times = [] ;
              var vector = $('#schedtime').data('vector') ;
              var sbegin = $('#schedtime').data('begin');
              for ( var i=0; i < responses.length; i++ )
              {
                var href = $('href',responses[i]).text();
                var rstatus = $('request-status',responses[i]).text();
                var cdata = $('calendar-data',responses[i]).text();
                if ( /2.0/.test( rstatus ) )
                {
                  var ic = new iCal(cdata);
                  var ics = ic.ics[0];
                  var suser = $('#schedusers li[user="'+ics.vcalendar[ics.TYPE].attendee.PROP['cn']+'"]').attr('class');
                  if ( ics.vcalendar[ics.TYPE]['freebusy'] == undefined )
                    continue;
                  var fb = [];
                  var fbd = ics.vcalendar[ics.TYPE].freebusy.DATA;
                  for ( var t in fbd )
                  {
                    if ( ! /^FREE/.test(t) )
                      fb = fb.concat(fbd[t]);
                  }
                  for ( var j=0; j < fb.length; j++ )
                  {
                    var begin  = fb[j].start; 
                    var end    = fb[j].end;
                    var offset = 'start' + Math.round(begin.getUTCMinutes()/15);
                    times.push(fb[j]);
                    $('#schedtime .sday'+begin.getUTCDate()+'.shour'+begin.getUTCHours()).append('<span class="'+suser+' '+offset+' '+fb[j].type+'" data-hours="'+parseInt((end.getTime()-begin.getTime())*4/3600000)/4+'"></span>');
                    if ( ( begin >= es && end <= es ) || ( begin >= ee && end <= ee ) ||
                        ( begin >= es && end <= ee ) || ( begin <= es && end >= ee ) )
                      $('#schedtime .sched').addClass('conflict');
                    var s = parseInt(((begin - sbegin)/60000)/15);
                    var e = parseInt(((end - sbegin)/60000)/15);
                    for ( var x = s; x < e; x++ )
                      vector[x] = 1;
                  }
                  if ( debug ) 
                    console.log(ics);
                }
                else
                  $('#schedtime .' + suser ).addClass('warning');
              }
              $('#schedtime').data('fb',times);
              $('#schedtime').data('vector',vector);
            }
          }});
        popupOverflowVisi();
        $(this).after(n);
      });
  $('.attendee').die('focus');
  $('.attendee').die('blur');
  $('.attendee').live('focus',attendeeFocus);
  $('.attendee',ret).bind('keydown',completePrincipal);
  $('.attendee').live('blur',function (e)
    {
      popupOverflowAuto();
      $('.completionWrapper',$(e.target).parent()).remove();
      var t = $(e.target).text(); 
        var el = t.split( ' ' );
        var cn,eml;
        for ( var j=0; j < el.length; j++ )
        {
          if ( /@/.test(el[j]) )
          {
            eml = String(el[j]).replace( /^mailto:/, '' );
            eml = eml.replace( /[<>"']/g, '' );
            el.splice(j,1);
          }
        }
        cn = el.join(' ');
        $(e.target).data('email',eml);
        $(e.target).text(cn);
    });
  $(ret).append(plus);
  if ( /calendar-auto-schedule/.test ( $.fn.caldav.serverSupports ) && $.fn.caldav.outboxMap[$.fn.caldav.data.myPrincipal] )
    $(ret).append(freebusy);
  return ret;
}

function attendeeFocus (e)
{
  popupOverflowVisi();
  var t = $(e.target).text(); 
  var eml=$(e.target).data('value'); 
  $('.completionWrapper',$(e.target).parent()).remove();
  $(e.target).before ( '<div class="completionWrapper"><div class="completion"></div></div>');
  if ( eml ) 
    eml = eml.replace(/^mailto:/,'');
  else 
    return; 
  if ( ! t.match(eml) ) 
  { 
    $(e.target).text($.trim(t)+' '+eml); 
  }
}

function attendeeEdited ( element, attendee ) 
{
  var atnds = $('.attendee',element);
  var atts = [], props = [];
  var edited = false;
  if ( ! attendee.VALUES )
  {
    atts.push  ( attendee.VALUE );
    props.push ( attendee.PROP  );
  }
  else
  {
    atts  = attendee.VALUES;
    props = attendee.PROPS;
  }
  if ( atnds.length == 0 )
  {
    var e = $.trim($(atnds[i]).text()).split( ' ' );
    var cn,eml ;
    for ( var j=0; j < e.length; j++ )
    {
      if ( /@/.test(e[j]) )
      {
        eml = String(e[j]).replace( /^mailto:/, '' ).replace( /[<>"']/g, '' );
        e.splice(j,1);
      }
    }
    if ( eml == '' && $(atnds[i]).data('email') )
      eml = $.trim($(atnds[i]).data('email'));
    cn = e.join(' ');
    var np = {cn:cn,cutype:'INDIVIDUAL',email:eml,partstat:$(atnds[i]).data('partstat'),rsvp:$(atnds[i]).data('rsvp')};
    if ( /calendar-auto-schedule/.test ( $.fn.caldav.serverSupports ) )
      np['schdeule-agent']='SERVER';
    attendee.UPDATE('mailto:' +eml,np);
    return true;
  }
  for ( var i=0; i < atts.length; i++ )
  {
    if ( $('.value[data-value="'+atts[i]+'"]').length == 0 || ( props[i] == null && ! /^mailto/.test(atts[i]) ) )
    {
      atts.splice(i,1);
      props.splice(i,1);
      edited = true;
    }
  }
  var addresses = '';
  for ( var i=0; i < atnds.length; i++ )
  {
    var p = $(atnds[i]).data();
    if ( props[a] == undefined )
      props[a] = {};
    if ( p['value'] && atts.indexOf(p['value']) > -1 )
    {
      var a = atts.indexOf(p['value']);
      if ( $.trim($(atnds[i]).text()) == '' )
      {
        atts.splice(a,1);
        props.splice(a,1);
        edited = true;
        continue;
      }
      if ( props[a]['cn'] != $.trim($(atnds[i]).text()) )
      {
        edited = true;
        props[a]['cn'] = $.trim($(atnds[i]).text()); 
      }
      if ( props[a].email != $.trim(p.email) )
      {
        props[a].email = $.trim(p.email);
        atts[a] = 'mailto:'+p.email;
        edited = true;
      }
    }
    else
    {
      var e = $.trim($(atnds[i]).text()).split( ' ' );
      var cn,eml = '' ;
      for ( var j=0; j < e.length; j++ )
      {
        if ( /@/.test(e[j]) )
        {
          eml = String(e[j]).replace( /^mailto:/, '' ).replace( /[<>"']/g, '' );
          e.splice(j,1);
        }
      }
      if ( eml == '' && $(atnds[i]).data('email') )
        eml = $.trim($(atnds[i]).data('email')).replace( /^mailto:/, '' ).replace( /[<>"']/g, '' );
      cn = e.join(' ');
      var np = {
          cn:cn,
          cutype:'INDIVIDUAL',
          email:eml,
          partstat:($(atnds[i]).data('partstat')?$(atnds[i]).data('partstat'):'NEEDS-ACTION'),
          rsvp:($(atnds[i]).data('rsvp')?$(atnds[i]).data('rsvp'):'TRUE')
        };
      
      addresses = addresses + ', ' + cn + ' <' + eml + '>';
      
      if ( $.fn.caldav.supports['calendar-auto-schedule'] && eml != $.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].email )
        np['schdeule-agent']='SERVER';
      attendee.UPDATE('mailto:' +eml,np);
      edited = true;
    }
  }
  var ics = $($('#calpopupe').data('event')).data('ics');
      var mailtext = 'mailto:' + addresses + '?subject=' + ics.vcalendar[ics.TYPE].summary + '&body=ics goes here' ;
      console.log( mailtext );
  return edited;
}

function printOrganizer(o)
{
  return $('<span class="value" data-cn="'+ (o.PROP?o.PROP.cn:'')  +'" data-value="'+o.VALUE+'" >'+o.VALUE+'</span>' );
}

function organizerEdited(e,o)
{
  if ( typeof o.PROP == "object" )
    o.PROP.cn = $(e).text();
  else
    o.PROP = {cn:$(e).text()};
  if ( o.VALUE == undefined )
    o.VALUE = $(e).data('value');
}

function printAlarm(a)
{
  var alarms = [];
  if ( a.action != undefined )
    alarms.push(a);
  else
    alarms = a;
  console.log( alarms.length + ' alarms' );
  var ret  = $('<span><span>');
  for ( var A in alarms )
  {
    if ( alarms[A].trigger != undefined && alarms[A].action.VALUE == "AUDIO" || alarms[A].action.VALUE == "DISPLAY" )
    {
      if ( alarms[A].trigger.DURATION != undefined )
      {
        var atime = alarms[A].trigger.DURATION;
        if ( atime.minutes > 0 )
          var avalue = atime.minutes,type='minutes';
        if ( atime.hours > 0 )
          var avalue = atime.hours,type='hours';
        if ( atime.days > 0 )
          var avalue = atime.days,type='days';
        if ( atime.weeks > 0 )
          var avalue = atime.weeks,type='weeks';
        if ( atime.negative )
          var type = type + ' before';
        else
          var type = type + ' after';
      }
      if ( alarms[A].trigger.DATE != undefined )
      {
        var avalue = alarms[A].trigger.DATE.prettyDate();
        var type = 'on date';
      }
      else if ( alarms[A]['x-apple-proximity'] )
      {
        continue ;
      }
      else 
        continue ;
      var atext = '';
      if ( alarms[A].description != undefined )
        atext = alarms[A].description;
      var related = valueNames.START;
      if ( alarms[A].trigger.PROP && alarms[A].trigger.PROP.related && alarms[A].trigger.PROP.related != undefined )
        related = valueNames[alarms[A].trigger.PROP.related];
      $(ret).append('<span class="alarm"><span class="action" contenteditable="true" data-value="'+alarms[A].action.VALUE+'" >'+valueNames[alarms[A].action.VALUE]+
          '</span><span class="value" contenteditable="true" >'+avalue+'</span><span class="length" contenteditable="true" >'+durations[type]+'</span>'+
          '<span class="related" contenteditable="true" >'+related+'</span></span>');
    }
  }
  var plus = $('<span class="plus">'+ui.add+'</span>').click(function(){ var n = $('<span class="alarm"><span class="action" contenteditable="true" >'+valueNames.AUDIO+'</span><span class="value" contenteditable="true" >15</span><span class="length" contenteditable="true" >'+durations['minutes before']+'</span><span class="related" contenteditable="true" >'+valueNames.START+'</span></span>');$('.action,.length,.related',n).bind('click, focus',alarmFieldClick);$(this).before(n);});
  $(ret).append(plus);
  $('.action,.length,.related',ret).bind('click, focus',alarmFieldClick);
  return ret;
}

function alarmEdited ( valarm , data, event ) 
{
  var alarms = [],add=false;
  var edited = false;
  if ( valarm != undefined && valarm.action != undefined )
    alarms.push(valarm);
  else if ( valarm != undefined && valarm.length > 1 )
    alarms = valarm;
  else
    add = true;
  var a = $('span > span.alarm',data);
  for ( var i=0; i < a.length; i++ )
  {
    if ( $('.action',a[i]).text() == valueNames['NONE'] )
    {
      if ( alarms[i] != undefined )
        alarms[i] = undefined ;
      continue;
    }
    if ( alarms[i] == undefined )
    {
      alarms[i] = {BEGIN:true,UPDATED:true};
      add = true;
    }
    var value = $('.value',a[i]).text();
    var action = $('.action',a[i]).text();
    var related = $('.related',a[i]).text();
    var length = $('.length',a[i]).text();
    for ( var j in valueNames ) 
      if ( valueNames[j] == action )
        break;
    action = j;
    for ( var j in durations ) 
      if ( durations[j] == length )
        break;
    length = j;
    for ( var j in valueNames ) 
      if ( valueNames[j] == related )
        break;
    related = j;
    if ( alarms[i].action == undefined )
    {
      alarms[i].action = event.PARENT.newField('action',action);
      alarms[i].action.PARENT = alarms[i]; 
      edited = true;
    }
    else if ( alarms[i].action.VALUE != action )
    {
      alarms[i].action.UPDATE(action);
      edited = true;
    }
    if ( length == 'on date' )
    {
      if ( alarms[i].trigger == undefined || alarms[i].trigger.DURATION != undefined )
      {
        alarms[i].trigger = event.PARENT.newField('trigger',Zero().parsePrettyDate(value),{VALUE:'DATE-TIME',RELATED:undefined});
        alarms[i].trigger.PARENT = alarms[i]; 
        edited = true;
      }
      else
      {
        alarms[i].trigger.UPDATE(Zero().parsePrettyDate(value));
        edited = true;
      }
    }
    else
    {
      var dur = parseDuration(value+' '+length);
      console.log(dur);
      if ( alarms[i].trigger == undefined || alarms[i].trigger.DATE != undefined )
      {
        alarms[i].trigger = event.PARENT.newField('trigger',dur);
        alarms[i].trigger.PARENT = alarms[i]; 
        edited = true;
      }
      else if ( alarms[i].trigger.DURATION != dur )  
      {
        alarms[i].trigger.UPDATE(dur);
        edited = true;
      }
      if ( alarms[i].trigger.PROP != undefined )
      {
        if ( ! alarms[i].trigger.PROP.related || alarms[i].trigger.PROP.related != related )
        {
          alarms[i].trigger.PROP.related = related;
          edited = true;
        }
      }
      else
      {
          alarms[i].trigger.PROP= {'related': related};
          edited = true;
      }
    }
  }
  if ( add )
  {
    edited = true;
    if ( alarms.length == 1 )
      event.vcalendar[event.TYPE].valarm = alarms[0];
    else
      event.vcalendar[event.TYPE].valarm = alarms;
  }
  return edited;
}

function alarmFieldClick(e)
{
  var f = {length:['minutes before','hours before','days before','weeks before','minutes after','hours after','days after','weeks after','on date'],
          action:['AUDIO','DISPLAY'],related:['START','END']};
  var options = f[$(e.target).attr('class')]; 
  if ($(e.target).attr('class') == 'length' ) 
    var list = durations;
  else
    var list = valueNames;
  var allowNone = false;
  if ($(e.target).attr('class') == 'action' ) 
    allowNone = true;
  var currentValue = $(e.target).text();
  var comp = buildOptions({target:e.target,options:options,text:list, none: allowNone, spaceSelects:true, search:false,removeOnEscape:true} );
  popupOverflowVisi();
  $(e.target).before(comp);
}

function eventEdited (e)
{
  var edited = false;
  // TODO add undo/redo preferrably with the html5 DOM undoManager
  //window.undoManager.add(e.target,'edited event');
  var cp = $($('#wcal').data('popup'));
  if ( $(cp).attr('id') != 'calpopupe')
  {
    $(cp).hide();
    return false;
  }
  var evt = $(cp).data('event');
  var c = $($(cp).data('event')).attr('class');
  if ( c != undefined && c.match(/calendar(\d+)/) )
    c = c.match(/calendar(\d+)/)[1];
  else
  {
    var c = $('#callist li.selected'); 
    if ( c.length > 0 )
      c = $(c).attr('class').match(/calendar(\d+)/)[1];
    else
      c = 0;
  }
  var d = $($(cp).data('event')).data('ics');
  if ( ! d instanceof Object )
    return false;
  var mod = '',dmod = false;
  if ( d.vcalendar.vevent != undefined && $('span:contains('+fieldNames.dtstart+') + span',cp).length )
  {
    if ( debug ) console.log ( 'checking vevent for basic validity' );
    try {
      var dts = (new Date()).parsePrettyDate ( $('span:contains('+fieldNames.dtstart+') + span',cp).text() );
    } catch (e) {
      $('span:contains('+fieldNames.dtstart+') + span',cp).css('outline','1px solid red').attr('tabindex',-1).focus();
      return false;
    }
    if ( $('span:contains('+fieldNames.dtend+') + span',cp).length > 0 )
    {
      var dte = (new Date()).parsePrettyDate ( $('span:contains('+fieldNames.dtend+') + span',cp).text() );
      if ( dts > dte )
      {
        $('span:contains('+fieldNames.dtend+') + span',cp).css('outline','1px solid red').attr('tabindex',-1).focus();
        return false;
      }
    }
    else if ( $('span:contains('+fieldNames.duration+') + span',cp).length > 0 )
    {
      var dur = parseDuration ( $('span:contains('+fieldNames.duration+') + span',cp).text() )
      if ( dur['negative'] )
      {
        $('span:contains('+fieldNames.duration+') + span',cp).css('outline','1px solid red').attr('tabindex',-1).focus();
        return false;
      }
    }
  }
  if (  $('span:contains('+fieldNames.duration+') + span',cp).text() == fieldNames.duration )
  {
    var datefields = {on:'dtstart','all day':'dtend'};
  }
  else
    var datefields = {from:'dtstart',to:'dtend',due:'due',completed:'completed'};
  if ( d.vcalendar.vevent != undefined )
  {
    var props = d.PARENT.components.vevent.required.concat(d.PARENT.components.vevent.optional).concat(['ESTART','EEND']);
    var missing= new Array (),type = 'vevent';
  } 
  else if ( d.vcalendar.vtodo != undefined )
  {
    var props = d.PARENT.components.vtodo.required.concat(d.PARENT.components.vtodo.optional);
    var missing= new Array (),type = 'vtodo';
  }
  if ( /calendarserver-private-comments/.test ( $.fn.caldav.serverSupports ) )
    props.push('x-calendarserver-private-comment');
  if ( /calendarserver-private-events/.test ( $.fn.caldav.serverSupports ) )
    props.push('x-calendarserver-access');
  for ( var x in props )
  {
    var label = fieldNames[props[x]];
    if (debug) console.log ( 'looking for changes in field: ' + ( label == undefined ? props[x] + ' no label': label ) );
    if ( label == undefined )
      continue;
    var element = $('span.label[data-field="'+label+'"] + span',cp);
    if ( $(element).length )
    {
      //var element = $('span.label[data-value="'+String(label).replace(/([\[\]'"])/g,'\\$1')+'"] + span',cp)[0];
      var element = $('span.label[data-field="'+label+'"] + span',cp)[0];
      var text = $.trim ( unexpandText( element ) ); 
      if  ( d.vcalendar[type][props[x]] == undefined )
      {
        d.vcalendar[type][props[x]] = d.PARENT.newField( props[x] );
      }
      if ( $(element).data('value') == text )
        continue ;
      if ( d.vcalendar[type][props[x]] == text )
        continue ;
      if ( $.trim($(element).text()) == '' )
      {
        if ( d.PARENT.components.vevent.required.indexOf ( props[x] ) > -1 )
        {
          $(element).css('outline','1px solid red').attr('tabindex',-1).focus();
          return false;
        }
        else
          delete d.vcalendar[type][props[x]];
      }
      else if ( props[x] == 'organizer' )
        organizerEdited ( $(element), d.vcalendar[type][props[x]] );
      else if ( props[x] == 'attendee' )
      {
        if ( attendeeEdited ( $(element), d.vcalendar[type][props[x]] ) == false )
          continue;
      }
      else if ( props[x] == 'rrule' )
        d.vcalendar[type][props[x]].UPDATE ( $(element) );
      else
        d.vcalendar[type][props[x]].UPDATE ( text );
      if ( debug ) console.log ( 'modified prop ' + props[x] + ' with display name ' + label + ' from type ' + type + "\n  from " + d.vcalendar[type][props[x]] + "\n    to " + $(element).text() );
      mod += props[x];
      edited=true;
    }
  }
  // handle alarms
  if ( d.vcalendar[type].valarm != undefined || $('span:contains('+ui.alarm+')').length > 0 )
  {
    if ( d.vcalendar[type].valarm == undefined )
      d.vcalendar[type].valarm = {BEGIN:true,UPDATED:true};
    var ale = alarmEdited(d.vcalendar[type].valarm, $('li > span:contains('+ui.alarm+')',cp).parent(),d);
    if (ale)
      edited = true;
  }

  if ( $(evt).attr('href') == '+&New Event' )
    edited = true;
  if ( edited )
  {
    var href = $(evt).attr('href');
    d.vcalendar[type].dtstamp.UPDATE ( ( new Date()) );
    if ( typeof ( d.vcalendar[type].sequence ) != "undefined" )
      d.vcalendar[type].sequence.VALUE++;
    else
      d.vcalendar[type].sequence = d.PARENT.newField('SEQUENCE',1);

    var cals = $(document).caldav('calendars');
    if ( href != '+&New Event' )
    {
      $('[href="'+href+'"]').fadeOut('fast',function (){$(this).remove();  } );
      $(document).caldav('putEvent',{url:href},d.PARENT.printiCal (  )); 
    }
    else
    {
      href = $(document).caldav('calendars')[c].href + d.vcalendar[type].uid + '.ics'; 
      var params = { url:href};
      $(document).caldav('putNewEvent',params,d.PARENT.printiCal (  )); 
    }
    if ( d.TYPE == 'vevent' )
      insertEvent(href,d,c,$('#wcal').data('firstweek'),$('#wcal').data('lastweek'));
    if ( d.TYPE == 'vtodo' )
      insertTodo(href,d,c);
  }
  else
    if ( $(evt).attr('href') != '+&New Event' )
      $(document).caldav('unlock',$(evt).attr('href') );
  $('#calpopupe').hide();
  $('#wcal').removeData('popup');
  $('#wcal').removeData('clicked');
  return true;
}

function removeEvent (href)
{
  $('[href="'+href+'"]').fadeOut('fast',function (){$(this).remove();  } );
}

function eventDeleted (e)
{
  var edited = false;
  // TODO add undo/redo preferrably with the html5 DOM undoManager
  //window.undoManager.add(e.target,'edited event');
  
  var t = $($('#wcal').data('clicked'));
  if ( ! $(t).length )
    t = $('#wcal').data('deleting');
  var c = $(t).attr('class').match(/calendar(\d+)/)[1];
  var src = $(t).attr('href');
  var cals = $(document).caldav('calendars');
  var cp = $($('#wcal').data('popup'));
  var d = $(t).data('ics');
  if ( ! d instanceof Object )
    return false;
  if ( d.vcalendar[d.TYPE].attendee && e.notify == undefined )
  {
    $('#wcal').data('deleting',t);
    $('#wcal').data('drop-question',e);
    questionBox(notifyquestion[0],notifyquestion[1],
        function(e) {
          var evt = $('#wcal').data('drop-question');
          $('#wcal').removeData('drop-question');
          if ( e == -1 ) 
          {
            $('#wcal').removeData('popup');
            $('#wcal').removeData('clicked');
            return false;
          }
          evt.notify = e == 0 ? 'T' : 'F' ;
          eventDeleted(evt);
        } );
  }
  else if ( d.TYPE =='vtodo' )
  {
    var params = { url:src};
    $(document).caldav('unlock',src );
    $(document).caldav('delEvent',params); 
    //$(t).remove();
  }
  else if ( d.vcalendar.vevent.rrule == undefined  && d.vcalendar.vevent['recurrence-id'] == undefined )
  {
    var params = { url:src};
    if ( e.notify != undefined )
      params['Schedule-Reply'] = e.notify
    $(document).caldav('unlock',src );
    $(document).caldav('delEvent',params); 
    //$(t).remove();
  }
  else if ( e.all == undefined )
  {
    $('#wcal').data('deleting',t);
    $('#wcal').data('drop-question',e);
    questionBox(deletequestion[0],deletequestion[1],
        function(e) {
          var evt = $('#wcal').data('drop-question');
          $('#wcal').removeData('drop-question');
          if ( e == -1 ) 
          {
            $('#wcal').removeData('popup');
            $('#wcal').removeData('clicked');
            return false;
          }
          evt.all = e == 0 ? true : false ;
          eventDeleted(evt);
        } );
    return ;
  }
  else if ( e.all == true )
  {
    var params = { url:src};
    $(document).caldav('unlock',src );
    if ( e.notify != undefined )
      params['Schedule-Reply'] = e.notify
    $(document).caldav('delEvent',params); 
    $('[href="'+$(t).attr('href')+'"]').fadeOut('fast',function (){$(this).remove();  } );
  }
  else if ( e.all == false )
  {
    if ( d.vcalendar.vevent['recurrence-id'] != undefined )
    {
      d.DELETE();
    }
    else
    {
      var tz = $.extend(true,{},d.vcalendar.vevent.dtstart.PROP);
      if ( d.vcalendar.vevent.exdate == undefined )
        d.vcalendar.vevent.exdate = d.PARENT.newField('EXDATE',$(t).attr('instance'),tz);
      else
        d.vcalendar.vevent.exdate.UPDATE($(t).attr('instance'),tz);
    }
    var href = $(t).attr('href');
    $(t).fadeOut('fast',function (){$(t).remove();  } );
    var params = { url:href};
    if ( e.notify != undefined )
      params['Schedule-Reply'] = e.notify
    $(document).caldav('putEvent',params,d.PARENT.printiCal (  )); 
    // add exdate
  }
  else
    console.log('logic error deleting event');
  $('#wcal').removeData('popup');
  $('#wcal').removeData('clicked');
  return true;
}

function eventSort( e )
{
  var events = $(e).children('li');
  $(events).detach();
  events.sort(function (a,b)
      {
        if ( $(a).hasClass('multiday') && $(b).hasClass('multiday') )
          return Zero().parseDate($(a).attr('instance')).getTime() - Zero().parseDate($(b).attr('instance')).getTime();
        else if ( $(a).hasClass('multiday') )
          return -1; 
        else if ( $(b).hasClass('multiday') )
          return 1; 
        else if ( $(a).attr('order') )
          return $(a).attr('order') - $(b).attr('order'); 
        else 
          return $(a).data('time') - $(b).data('time'); 
      });
  $(e).append(events);
}

function todoSort( e )
{
  var events = $(e).children('li');
  var flip = settings.todoSortReverse;
  $(events).detach();
  var sortorder = $(e).attr('sort');
  if ( sortorder == 'manual' )
    sortorder = 'data-time';
  if ( / /.test ( sortorder ) )
    sortorder = sortorder.replace(/ /,'-');
  events.sort(function (a,b)
      {
        if ( flip )
        {
          var c = b;
          b = a
          a = c
        }
        if ( $(a).attr(sortorder) && $(b).attr(sortorder) )
          return $(a).attr(sortorder) - $(b).attr(sortorder); 
        else if ( $(a).attr(sortorder) )
          return 1;
        else if ( $(b).attr(sortorder) )
          return -1;
        else 
          return 0;
      });
  $(e).append(events);
}

function popupOverflowVisi()
{
  var c = Number($($('#wcal').data('popup')).data('overflow')) + 1;
  $($('#wcal').data('popup')).data('overflow',c);
  $($('#wcal').data('popup')).css({overflow:'visible'});
}

function popupOverflowAuto()
{
  var c = Number($($('#wcal').data('popup')).data('overflow')) - 1;
  $($('#wcal').data('popup')).data('overflow',c);
  if ( c == 0 )
    $($('#wcal').data('popup')).css({overflow:'auto'});
}

function scrollCal (d) 
{
  var fw=$('#wcal').data('firstweek');
  var lw=$('#wcal').data('lastweek');
  var od = new Date(d.getTime());
  var ed = new Date(d.getTime());
  if ( ! $('#wcal').hasClass('weekview') )
  {
    od.add ('d', -7-parseInt( $('#wcal')[0].clientHeight / $('.today')[0].clientHeight /2 ) * 7);
    ed.add ('w', parseInt( $('#wcal')[0].clientHeight / $('.today')[0].clientHeight /2 ) +1 );
  }
  var nd = new Date(d.getTime());
  if ( od < fw )
  { 
    var s = fw;
    nd.setDate(nd.getDate()-28);
    $.fn.caldav.eventAverageTime = 100;
    while ( s > nd )
    { 
      $('#calt').prepend(buildweek(s));
      s.setDate(s.getDate()-7);
    }
    $('#wcal').data('firstweek',s);
  }
  if ( ed > lw )
  {
    var s = lw;
    $.fn.caldav.eventAverageTime = 100;
    while ( s < ed || $('#day_'+ d.LocalDayString() ).length == 0 )
    { 
      $('#calt').append(buildweek(s));
      s.setDate(s.getDate()+7);
    }
    $('#wcal').data('lastweek',s);
  }
  
  var day = $('#day_'+ d.DayString() ); 
  $('#wcal').scrollTop ( day[0].offsetTop - (( $('#wcal')[0].clientHeight /2) -($('.today')[0].clientHeight /2 )) );

  var currentweek = $('.weeknum.currentweek');
  var centerrow = $('#calt tr:eq(' + Math.floor( ($('#wcal').scrollTop() + $('#wcal')[0].clientHeight / 2 ) / $('#calt tr:eq(0)')[0].clientHeight ) + ') .weeknum');
  $(currentweek).removeClass('currentweek');
  $(centerrow).addClass('currentweek');
  var row = $('.header:last',$(centerrow).parent());
  if ( $(row).length < 1 )
    return;
  $('#calmonthname').text($(row).attr('month'));
  var year = $(row).parent().attr('id').replace(/day_([0-9]{4}).*/,'$1');
  $('#calyearname').text( year );
}

function currentWeek ( returnDate )
{
  var st = $('#wcal').scrollTop();
  var oh = $('#calt tr:eq(0)')[0].clientHeight;
  if ( $('#wcal').hasClass('weekview') )
    var row = Math.round( st / oh );
  else
    var row = Math.round( (st + ($('#wcal')[0].clientHeight -oh)/ 2 ) / oh );
  if ( returnDate )
  {
    var d = new Date();
    var ds = $('#wcal tr:eq(' + parseInt ( row ) + ') .day:eq(0)').attr('id').replace(/day_/,'');
    d.parseDate (ds);
    return d;
  }
  else
    return row ;
}

function buildcal(d)
{
  if ( d != undefined )
    s = d;
  else
    s = new Date();
  s.setDate(s.getDate()-7);
  $(document.body).append ('<div id="em" style="postion:absolute; float: left; left: -5000; top: 100; width: 1em; height: 1em; overflow: hidden; background: none; margin:0; padding: 0; border: none; outline: none;">&nbsp;</div>');
  calstyle();
  var calwrap = $('<div id="calwrap"><audio id="calalertsound" src="SweetAlertSound2.wav" type="audio/wave" preload="auto" autobuffer ></audio></div>');
  $(calwrap).data('tabindex',10);
  calwrap.nextIndex = function (){var t = $(this).data('tabindex'); t++; $(this).data('tabindex',t); return t; };
  
  var sidebar = $('<div id="calsidebar" ><div class="sidetitle">'+ui.calendar+'</div></div>');
  var sideul = $('<ul id="callist"  ></ul>');
  var cals = $(document).caldav('calendars');
  for (var i=0;i<cals.length;i++)
  {
    if ( cals[i].principalName == undefined || cals[i].principalName == '' )
      continue;
    var cparent = $('li:contains('+cals[i].principalName+') > ul',sideul);
    if ( ! cparent.length )
    {
      if ( $.fn.caldav.principals[$.fn.caldav.principalMap[cals[i].principal]] && $.fn.caldav.principals[$.fn.caldav.principalMap[cals[i].principal]].desc )
        var desc = $.fn.caldav.principals[$.fn.caldav.principalMap[cals[i].principal]].desc;
      else
        var desc = '';
      $('<li class="open"  ><span title="'+ desc +'" >'+cals[i].principalName+'</span><ul data-mailto="'+cals[i].mailto+'" data-principal="'+cals[i].principal+'" ></ul></li>').appendTo(sideul);
      var cparent = $('li:contains('+cals[i].principalName+') > ul',sideul);
    }
    var ce = $('<li class="calendar'+i+'" order="'+cals[i].order+'" title="'+cals[i].desc+'"><input type="checkbox" id="calendar'+i+'" checked="true" /><span >'+ cals[i].displayName+'</span></li>');

    if ( cals[i].perms.write || cals[i].perms['write-content'] )
    {
      $(ce)[0].addEventListener('drop',calDrop,true);
      $(ce)[0].addEventListener('dragenter', calDragEnter,true);
      $(ce)[0].addEventListener('dragover', calDragOver,true);
      $(ce).click (selectCalendar);
    }
    $(ce).dblclick (editCalendar);
    $(ce).data(cals[i]);
    $(cparent).append(ce);
    eventSort(cparent);
    var ss = styles.getStyleSheet ( 'calstyle' );
    if ( settings.calendars != undefined && settings.calendars[cals[i].href] != undefined && settings.calendars[cals[i].href] == false )
    {
      $('#calendar'+i,cparent).attr('checked',false);
      $('#calendar'+i,cparent).val(false);
      ss.addRule ( '#caltodo .event.calendar'+i ,'display: none;'  );
      ss.addRule ( '#wcal .day .event.calendar'+i ,' opacity: 0; display: none; '  );
      ss.addRule ( '#wcal .day .event.calendar'+i +'bg',' opacity: 0; display: none; ' );
    }
    else
    {
      ss.addRule ( '#wcal .day .event.calendar'+i ,' opacity: 1; '  );
      ss.addRule ( '#wcal .day .event.calendar'+i +'bg',' opacity: 1; ' );
    }
  }
  var selectedcal = 0; // TODO restore selected calendar from last login
  if ( settings['selectedCalendar'] != undefined && settings['selectedCalendar'].length > 2 )
    selectedcal = cals.map(function (a){return a.href}).indexOf(settings['selectedCalendar']);
  else if ( settings['selectedCalendar'] != undefined )
    selectedcal = settings['selectedCalendar'];
  $('#calendar'+selectedcal,sideul).parent().addClass('selected');
  $('input',sideul).change(toggleCalendar);
  $('li > span',sideul).click (function (e){
    if ( $(this).next().length > 0 && $(this).next()[0].nodeName == 'UL' && e.pageX > $(this).offset().left+$(this).width() - $(this).height() * 2.25 )
    { 
      var p = $(this).next().data('principal');
      var principal = $.fn.caldav.principals[$.fn.caldav.principalMap[p]];
      editPrincipal ( principal );
      return false;
    }
    else
    { $('li.selected',$(this).parent()).toggleClass('selected');$(this).parent('li').toggleClass('open');$(this).parent('li').toggleClass('closed');}});
  $(sidebar).append(sideul);
  var invites = $('<div id="invitewrap"><ul id="calinvites"  ><li class="header" >'+ui.invitations+'</li></ul></div>');
  $(sidebar).append(invites);
  $(sidebar).append('<div class="calfooter group" tabindex="2"><div id="addcalendar" class="button" >'+ui.add+'</div><div id="calsettings" class="button" >'+ui.settings+'</div></div>');
  if ( String($('.jqcaldav').data('calproxyurl')).length > 1  )
  {
    $('#calfooter',sidebar).append('<div id="calsubscribe" class="button" >'+ui.subscribe+'</div>');
    $('#calsubscribe',sidebar).click(subscribeCalendar); 
  }
  if ( typeof ( startTranslating ) == "function" )
  {
    $('.calfooter',sidebar).append('<div id="caltranslate" class="button" >translate</div>');
    $('#caltranslate',sidebar).click(startTranslating);
  }
  $('#addcalendar',sidebar).click(addCalendar); 
  $('#calsettings',sidebar).click(calSettings); 
  $(calwrap).append(sidebar);
  if ( $.fn.caldav.reports['sync-collection'] )
    $(calwrap).append('<div id="calcenter" ><div id="calheader" tabindex="6"><span id="gototoday" class="button" >'+ui.today+'</span><span id="weekview" class="button" >'+ui.week+'</span><span id="refresh" class="button" >&#8635;</span><span id="calmonthname">' + months[s.getMonth()] + '</span><span id="calyearname">' + s.getFullYear() + '</span><span id="logout" class="button" >'+ui.logout+'</span></div>');
  else
    $(calwrap).append('<div id="calcenter" ><div id="calheader" tabindex="6"><span id="gototoday" class="button" >'+ui.today+'</span><span id="weekview" class="button" >'+ui.week+'</span><span id="calmonthname">' + months[s.getMonth()] + '</span><span id="calyearname">' + s.getFullYear() + '</span><span id="logout" class="button" >'+ui.logout+'</span></div>');
  $('#refresh',calwrap).click(function(){calendarSync(); return false;} );
  $('#gototoday',calwrap).click(function(){var d = new Date(); scrollCal ( d );return false;} );
  $('#logout',calwrap).click(function(){ logoutClicked(); return false;} );
  $('#weekview',calwrap).click(function()
    {
      var oh = $('#wcal tr:eq(0)')[0].clientHeight;
      d = currentWeek ( true ); 
      if($(this).text()=='Week')
      {
        $(this).text('Month');
        $('#wcal').data('dayHeight',oh);
        $('#wcal').addClass('weekview');
        scrollCal ( d );
      }
      else
      {
        $(this).text('Week');
        var dh = $('#wcal').data('dayHeight');
        var w = currentWeek ();
        var st = $('#wcal').scrollTop();
        //var row = Math.round( (st + ($('#wcal')[0].clientHeight -oh)/ 2 ) / oh );
        //var centerrow = $('#calt tr:eq(' + Math.round( (st + (oh-rows[0].clientHeight) / 2 ) / rows[0].clientHeight ) + ') .weeknum');
        var offset = Math.round( ( $('#wcal')[0].clientHeight/2 ) - dh / 2); 
        console.log ( dh + 'dayheight');
        $('#wcal').scrollTop(dh*w - offset);
        $('#wcal').removeClass('weekview');
        $('.currentweek').removeClass('currentweek');
        $('#calt tr:eq(' + w + ') .weeknum').addClass('currentweek');
      }
      currentTimeIndicator();
    });
  $('#calmonthname',calwrap).click(function(e){
      if ( e.pageX < $(this).offset().left + $(this).innerWidth() / 2 )
        var month = -1;
      else 
        var month = 1;
      var nm = $.inArray($(this).text(),months) + month;
      var nd = new Date ($('#calyearname').text() , nm , 7,0,0,0) ;
      scrollCal ( nd );
    });
  $('#calyearname',calwrap).click(function(e){
      if ( e.pageX < $(this).offset().left + $(this).innerWidth() / 2 )
        var year = -1;
      else 
        var year = 1;
      var nm = $.inArray($('#calmonthname').text(),months) ;
      var nd = new Date (($('#calyearname').text()-0)+year , nm , 7,0,0,0) ;
      scrollCal ( nd );
    });
  var calh = $('<table id="calh"></table>');
  var days = $('<thead class="days"></thead>');
  var tr = $('<tr></tr>');
  var day = settings.weekStart;
  for ( var i=0;i<7;i++)
  { 
    $(tr).append('<td>' + weekdays[day] + '</td>');
    day++;
    if ( day > 6 )
      day = 0;
  }
  $(days).append(tr);
  $(calh).append(days);
  $('#calheader',calwrap).append(calh);
  $('#calheader',calwrap).bind('keyup',function (e){ 
    var month = parseInt($.inArray($('#calmonthname').text(),months));
    var year = parseInt($('#calyearname').text());
    console.log ( year + ' ' + month + ' key ' + e.which );
    switch ( e.keyCode  )
    { 
      case 37:  // left arrow
        scrollCal ( new Date ( year-1 , month,1) );
        break;
      case 38: // up arrow
        scrollCal ( new Date ( year, month-1,1) );
        break;
      case 39: // right arrow
        scrollCal ( new Date ( year+1, month,1) );
        break;
      case 40:  // down arrow
        scrollCal ( new Date ( year, month+1,1) );
        break;
      default :
        return true;
    }
    e.preventDefault();
    return false;
    });
  if ( settings.todoShow )
    var show = settings.todoShow;
  else
    var show = "COMPLETED,CANCELLED,past due,upcoming,NEEDS-ACTION,IN-PROCESS";
  if ( settings.todoSortReverse == "false" )
    settings.todoSortReverse = false;
  if ( settings.todoSort )
    var sort = settings.todoSort;
  else
    var sort = "manual";
  var todobar = $('<div id="caltodo" tabindex="8"><div class="sidetitle">'+ui.todos+'<div><span class="button show">'+ui.show+'</span><span class="button sort">'+ui.sort+'</span></div></div><ul show="'+show+'" sort="'+sort+'"></ul></div>');
  $('.button.show', todobar).click(showVisTodos);
  $('.button.sort', todobar).click(showSortTodos);
  $('ul', todobar).dblclick(newevent);
  var v = $('ul', todobar); 
  $(v).bind('drop',calDrop);
  $(v).bind('dragenter', calDragEnter);
  $(v).bind('dragleave', calDragLeave);
  $(v).bind('dragover', calDragOver);
  $(calwrap).append(todobar);
  
  var cal = $('<div id="wcal" tabindex=7"><div id="caldrop" style="display:none;"><div></div></div></div>');
  cal[0]['recur'] = new Array;
  var startt = settings.start.getLongMinutes();
  var endt = settings.end.getLongMinutes();
  var ul = $('<ul class="hoursbg"></ul>');
  var d = new Date();
  d.setUTCMinutes(0);
  for ( var i=startt;i<=endt;i+=100)
  {
    d.setUTCHours(i/100);
    $(ul).append ( '<li class="time'+i+'" data-duration="60">'+d.prettyTime()+'</li>' );
  } 
  hw = $('<div class="hourswrapper"></div>').append(ul);
  $(document.body).append(hw);
  fhw = $('.hourswrapper').clone(true);
  hw = $(fhw).clone(true);
  $('li',hw).empty();

  $(cal).data('tabindex',5000);
  cal.nextIndex = function (){var t = $(this).data('tabindex'); t++; $(this).data('tabindex',t); return t; };
  $('#caldrop',cal)[0].addEventListener('dragenter', calDragOver,true);
  $('#caldrop',cal)[0].addEventListener('dragleave', calDragOver,true);
  $('#caldrop',cal)[0].addEventListener('dragover', calDragOver,true);
  var pop = $('<div id="calpopup" class="calpopup left" style="display:none;" data-clicked=0 ></div>');
  $(pop).appendTo(calwrap);
  $(pop).clone(true).attr('id','caldialog').removeClass('left').appendTo(calwrap);
  $(cal).data('edit_click',function ( e ){ var box = $('#wcal').data('popup');
      if ( $('#wcal').data('clicked') != e.target && $(e.target).parents(box).length < 1 && e.target != $(box)[0] )
      {
          var href = $($(box).data('event')).attr('href');
          if ( String(href).length > 1 && $.fn.caldav.locks[href] != undefined )
            $(document).caldav('unlock',href);
          $('#wcal').removeData('clicked');
          $('#wcal').removeData('popup'); 
          $(box).fadeOut();
          $(document).unbind('click',$('#wcal').data('edit_click')); 
          $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
      } } 
      );
  $(cal).data('edit_keyup',function (e){ 
      if ( e.keyCode == 27 ) 
      {
        if ( $('#wcal').data('eatCancel') ){$('#wcal').removeData('eatCancel'); return}
        var box = $('#wcal').data('popup'); 
        var href = $($(box).data('event')).attr('href');
        if ( String(href).length > 1 && $.fn.caldav.locks[href] != undefined )
          $(document).caldav('unlock',href);
        $(box).fadeOut(); 
        $('#wcal').removeData('popup'); 
        $('#wcal').removeData('clicked'); 
        $(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
        $(document).unbind('click',$('#wcal').data('edit_click'));
        $('#wcal').removeData('popup');
        $('#wcal').removeData('clicked'); 
      } 
      if ( e.keyCode == 13 && $(e.target).attr('multiline') != true )
      {
        e.stopPropagation();
        return false;
      }

    } 
      );

  var startdate = new Date(s.toString());
  startdate.setDate(startdate.getDate() -7);
  $(cal).data('firstweek',startdate); 
  var calt = $('<table id="calt"></table>');
  var rows = Math.ceil( window.innerHeight / 96 ) + 2;
  if ( rows < 3 )
    rows = 3;
  for ( var i=0;i<rows;i++)
  { 
    $(calt).append(buildweek(s));
    s.setDate(s.getDate()+7);
  }
  $('#day_'+ (new Date()).LocalDayString(),calt).addClass('today');
  $(cal).data('lastweek',s);
  $(cal).data('created',Date.now());
  $(cal).scroll(function() {
    var sh = $(this)[0].scrollHeight - 15;
    var st = $(this).scrollTop();
    var oh = $(this)[0].clientHeight;
    var ost = $(cal).data ('st');
    if ( ! ost )
      $(cal).data ('st',st);
    if ( Math.abs ( st - ost ) > 5 )
    {
      var rows = $('#calt tr:eq(0)');
      if ( $('#wcal').hasClass('weekview') )
        var centerrow = $('#calt tr:eq(' + Math.round( st  / rows[0].clientHeight ) + ') .weeknum');
      else
        var centerrow = $('#calt tr:eq(' + Math.round( (st + (oh-rows[0].clientHeight) / 2 ) / rows[0].clientHeight ) + ') .weeknum');
      if ( $(centerrow).length == 0 )
        var centerrow = $('#calt tr:last');
      var currentweek = $('.weeknum.currentweek');
      if ( centerrow != currentweek )
      {
        $(currentweek).removeClass('currentweek');
        $(centerrow).addClass('currentweek');
      }
      var row = $('.header:last',$(centerrow).parent());
      $('#calmonthname').text($(row).attr('month')); 
      var year = $(row).parent().attr('id').replace(/day_([0-9]{4}).*/,'$1');
      $('#calyearname').text( year );
      updateTimeline(); 
      $(cal).data ('st',st);
    }
    if (sh - st <= oh) {
      var s=$('#wcal').data('lastweek');
      for ( var i=1;i<3;i++)
      { 
        $('#calt').append(buildweek(s));
        s.setDate(s.getDate()+7);
      }
      $('#wcal').data('lastweek',s);
    }
    else if ( st < 45 && ost )
    {
      var s=$('#wcal').data('firstweek');
      var start = s;
      for ( var i=1;i<3;i++)
      { 
        $('#wcal').scrollTop ($('#wcal').scrollTop() + $('#calt tr:first')[0].clientHeight );
        $('#calt').prepend(buildweek(s));
        s.setDate(s.getDate()-7);
      }
      $('#wcal').data('firstweek',s);
    }
  });
  $(cal).append(calt);
  $('#calcenter',calwrap).append(buildtimeline());
  $('#calcenter',calwrap).append(cal);
  
  $('.timeline li',calwrap).click (function (e){
    scrollCal($(this).parents('.timeline').data('date'));
  });


  //var cals = $(document).caldav('calendars');
  for ( var i=0;i<cals.length;i++)
  {
    cals[i].url = String ( cals[i].url ).replace ( /\/\//g, '/' );
    $(document).caldav('getToDos', { url:cals[i].url,username:$.fn.caldav.options.username,password:$.fn.caldav.options.password},i);
  }
  
  currentTimeIndicator();
  window.setInterval(currentTimeIndicator,3000);
  return calwrap;
}

function questionBox ( question, answers, callback )
{
  $('#calpopupd').remove();
  var popup = $('#calpopup').clone(true).attr('id','calpopupd').removeClass('left right bottom');
  var litebox = $('<div id="callightbox"></div>').append (popup);
  $(litebox).appendTo('#calwrap');
  $('#wcal').data('popupe','#calpopupd');
  $('#calpopup').hide();
  $('#calpopupd').empty();
  $('#calpopupd').css({opacity:1,height: 'auto','min-height':'5em',padding: '1em'});
  $('#calpopupd').append('<div class="question">'+question+'</div>');
  var box = $('<div class="box'+answers.length+'"></div>');
  for ( var i=0;i<answers.length;i++)
  {
    $(box).append('<span><div class="button">'+answers[i]+'</div></span>');
  }
  $('.button',box).click(function(){var t =answers.indexOf($(this).text()); $('#callightbox').remove(); callback(t);});
  $(document.body).keypress(function(e){if (e.keyCode == 27){ $('#callightbox').remove(); callback(-1); return false;}});
  $('#calpopupd').append(box);
  $('#calpopupd').show();
  $('#calpopupd').css({position:'absolute',top:window.innerHeight/2-$('#calpopupd').height()/2,left:window.innerWidth/2-$('#calpopupd').width()/2,'z-index':99});
}

function buildtimeline ()
{
  var s = new Date();
  var b = s.getFullYear() - 3;
  var e = s.getFullYear() + 3;
  var redline = function (e){$('.line',this).css({top:e.pageY  - $(this).offset().top - ($('.line').height()/2)});
      if ($('.timeline').data('date') !=undefined)$('.line').html(($('.timeline').data('date').getMonth()+1)+'&nbsp;&mdash;');}
  var div = $('<div class="timeline" ></div');
  var ol = $('<ol></ol>');
  for ( var i=b;i<e;i++)
  {
    $(ol).append('<li class="year'+i+'" ><span>&mdash;' + i + '</span></li>');
  }
  $(ol).append('<li class="current"></li>');
  $('li',ol).hover( function (e){
      $(this).addClass('hover200');
      $(this).prev().addClass('hover165');
      $(this).prev().prev().addClass('hover120');
      $(this).next().addClass('hover165a').next().addClass('hover120a');
      $(this).mousemove(function(e){
        var y = Math.round ( 10.5 * ((e.pageY - $(this).offset().top) / $(this).height() ) );
        $('.timeline').data('date',new Date(Number($(this).text().replace(/[^0-9]/g,'')),y,1));
        });
    },function (e){
      $(this).removeClass('hover200').prev().removeClass('hover165').prev().removeClass('hover120');
      $(this).next().removeClass('hover165a').next().removeClass('hover120a');
      $(this).unbind ( 'mousemove' );
    });
    $(ol).hover( function (e){
        if ( $('.line',this).length == 0 ){$(this).append('<li class="line"></li>');}
        $(this).mousemove(redline);
      },function (e){
        $(this).unbind ( 'mousemove' );
        $('.line',this).remove();
        $('.display',this).empty();
      }); 
  $(div).append(ol);
  return div;
}

function updateTimeline()
{
  var st = $('#wcal').scrollTop();
  var rows = $('#calt tr:eq(0)');
  var row = $('#calt tr:eq(' + Math.floor( st / rows[0].clientHeight ) + ') .header:last');
  if ( $(row).length < 1 )
    return;
  var year = $(row).parent().attr('id').replace(/day_([0-9]{4}).*/,'$1');
  var month = $(row).parent().attr('id').replace(/day_....([0-9]{2}).*/,'$1');
  var tl = $('.timeline li.year'+year);
  if ( $(tl).length > 0 )
    $('.timeline li.current').css('top',$(tl).position().top + $(tl).height()*(month/12));
}

function currentTimeIndicator()
{
  var d = new Date ();
  var h = ( d.getHours() ) * 100;
  if ( h > settings.end.getLongMinutes() || h < settings.start.getLongMinutes() && $('#calcurrenttime').length > 0)
  {
    $('#calcurrenttime').remove();
    return ;
  }
  if ( $('#calcurrenttime').length == 0 )
    $('#day_' + d.LocalDayString() + ' .header' ).append('<div id="calcurrenttime"></div>');
  var p = $('#calcurrenttime').closest('.day');
  if ( $(p).attr('id') != 'day_' + d.LocalDayString() )
    $('#calcurrenttime').detach().appendTo('#day_' + d.LocalDayString() + ' .header' );
  h = h + ( d.getMinutes()/60) * 100;
  var percent = ((h)-settings.start.getLongMinutes())/(settings.end.getLongMinutes()-settings.start.getLongMinutes());
  var offset = $('.eventlist',p).outerHeight() - $('.eventlist',p).innerHeight();
  $('#calcurrenttime').css('top',offset+$('.eventlist',p).innerHeight()*percent);
}

var subStart=null,subEnd=null;
function buildweek(d,get)
{
  var start = new Date(d.getUTCFullYear(),d.getUTCMonth(),(d.getUTCDate()-d.getUTCDay()+settings.weekStart)), y = new Date(d.getUTCFullYear(),0,1);
  var weeknum = (start.getTime() - y.getTime())/1000;
  weeknum = weeknum / 604800;
  weeknum = Number(weeknum+1).toFixed(0); // TODO fix calculation if year starts after thursday
  var week = $('<tr class="week week'+weeknum+'"></tr>');
  $(week).append('<td class="weeknum" weeknum="'+weeknum+'"></td>');
  $(week).children().append($(fhw).clone(true));
  for ( var i=0;i<7;i++)
  { 
    $(week).append(buildday(start));
    start.setDate(start.getDate()+1);
  }
  $('ul',week).dblclick(newevent);
  $('td',week).dblclick(newevent);
  $.each($('td',week),function (i,v){
    $(v).bind('drop',calDrop);
    $(v).bind('dragenter', calDragEnter);
    $(v).bind('dragleave', calDragLeave);
    $(v).bind('dragover', calDragOver);});
  //$(week).append($('<span class="placeholder"></span>'));
  start = new Date(d.getFullYear(),d.getMonth(),(d.getDate()-d.getDay()));
  start.setTime(start.getTime()-60000*start.getTimezoneOffset());
  var end = new Date(d.getFullYear(),d.getMonth(),((d.getDate()-d.getDay())+7));
  end.setTime((end.getTime()-1)-60000*end.getTimezoneOffset());
  var cals = $(document).caldav('calendars');
  for ( var i=0;i<cals.length;i++)
  {
    $(document).caldav('getEvents', { url:cals[i].href,username:$.fn.caldav.options.username,password:$.fn.caldav.options.password},start,end,i);
  }
  if ( subStart != null )
  {
    if ( subStart > start )
      subStart = start;
    if ( subEnd < end )
      subEnd = end;
  }
  else
  {
    subStart = start;
    subEnd = end;
    window.setTimeout(function(){ addSubscribedEvents(-1, subStart,subEnd); subStart=null;subEnd=null;},350); 
  }
  return week;
}

function buildday (d)
{
  var day = $('<td class="day day'+ d.getDate() +' weekday'+ d.getDay() +' month'+ (d.getMonth()+1) +'" id="day_'+ d.LocalDayString() +'" ><div class="header" month="'+ months[d.getMonth()] +'" >'+ d.getDate() +'</div><ul class="eventlist"></ul></td>');
  $(day).prepend($(hw).clone(true));
  return day;
}


