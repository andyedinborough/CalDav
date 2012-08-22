// Copyright (c) 2011, Rob Ostensen ( rob@boxacle.net )
// See README or http://boxacle.net/jqcaldav/ for license 

function wwajax (conf)
{
  var w = new Worker('worker.js');
  w.onmessage = function(e)
  {
    switch ( e.status )
    {
      case -1:
        if ( w.errorHandler ) {
          w.errorHandler(e); }
        break;
      case 'progress':
        break;
      default:
        if ( w.successHandler ) {
          w.successHandler(e); }
        break;
    }
  };
  //w.errorHandler = conf.errorHandler;
  //w.successHandler = conf.successHandler;
  if ( conf.successHandler && typeof conf.successHandler == "function" )
    w.successHandler = conf.successHandler;
  var c = {};
  for ( var i in conf )
    if ( typeof conf[i] != "function" )
      c[i] = conf[i];
  c.cmd='config';
//  console.log(c);
//  var j = JSON.stringify(c);
//  c = JSON.parse(j);
  w.postMessage(c);
  return w;
}

// from Jan Mate
jQuery.fn.filterNsNode = function(name)
{
  return this.filter(
      function()
      {
        return (this.nodeName === name || this.nodeName.replace(RegExp('^[^:]+:',''),'') === name);
      }
    );
};


jQuery.extend ({
    httpoverride: function ( params, callback ) {
      return function ( r, s ) {
        if ( r.status == 200 )
        {
          var method = params.type;
          if ( params.beforeSend != undefined )
          {
            var bs = params.beforeSend;
            params.beforeSend = function ( r ) { bs(); r.setRequestHeader('X-Http-Method-Override',method ); }
          }
          else
            params.beforeSend = function ( r ) { r.setRequestHeader('X-Http-Method-Override',method); }
          params.type = 'POST';
          jQuery.ajax ( params );
        }
        else
        {
          if ( typeof callback == 'function' )
            callback( r, s );
        }
      };
    },
    options : function( origSettings ) { 
      $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'OPTIONS'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'OPTIONS',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    POST : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'POST'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   data: s.data,
                   contentType: s.contentType,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'POST',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    head : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'OPTIONS'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'HEAD',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    propfind : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'PROPFIND'},origSettings);
    var params = { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'PROPFIND',
                   url: s.url,
                   complete: s.complete,
                   withCredentials: true,
                   };
         params['success'] = jQuery.httpoverride ( params, s.success );
         return jQuery.ajax ( params );
     },
    proppatch : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'PROPPATCH'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'PROPPATCH',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
     },
    acl : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'ACL'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'ACL',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
     },

    report : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'REPORT'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'REPORT',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    mkcol : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'MKCOL'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'MKCOL',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    mkcalendar : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'MKCALENDAR'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'MKCALENDAR',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    move : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,origSettings,{type:'MOVE'});
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])}, 
                   contentType: s.contentType,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'MOVE',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    del : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,origSettings,{type:'DELETE'});
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])}, 
                   contentType: s.contentType,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'DELETE',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    put : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'PUT'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'PUT',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    lock : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'LOCK'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'LOCK',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    unlock : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'UNLOCK'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'UNLOCK',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    bind : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'BIND'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'BIND',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      },
    unbind : function( origSettings ) { 
    $.ajaxSetup.headers = {};
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'UNBIND'},origSettings);
        return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
                   cache: s.cache,
                   contentType: s.contentType,
                   data: s.data,
                   password: encodeURIComponent(s.password),
                   username: encodeURIComponent(s.username),
                   type: 'UNBIND',
                   url: s.url,
                   success: s.success,
                   complete: s.complete,
                   }
            );
      }
});

(function( $ ){
  var methods = {
    init : function( options ) { this.options = options; $.fn.caldav.options = options; if ( ! $.fn.caldav.events ) { $.fn.caldav.entries = new Object; } 
      $.fn.caldav.eventTiming = new Array();
      $.fn.caldav.eventAverageTime = 100;
      $.fn.caldav.coalesceEvents = new Array ();
      $.fn.caldav.principals = new Array ;
      $.fn.caldav.principalMap = new Object ;
      $.fn.caldav.inboxMap = new Object ;
      $.fn.caldav.outboxMap = new Object ;
      $.fn.caldav.calendarData = new Array ;
      $.fn.caldav.collectionData = new Array ;
      $.fn.caldav.locks = {};
      $.fn.caldav.supports = {};
      $.fn.caldav.reports = {};
      $.fn.caldav.syncable = false;
      $.fn.caldav.xmlNSfield = 'localName';
      if ( document.documentElement.baseName ) // ie just has to be different
          $.fn.caldav.xmlNSfield = 'baseName';
      if ( $( this.options.loading ).length < 1 )
      {
        var loading = $('<div id="caldavloading" style="display:none;position:fixed;left:100%;top:100%;margin-top:-1em;margin-left:-4em;text-align: center; width:4em; background-color:blue;color:white;-moz-border-top-left-radius:.5em;-webkit-border-top-left-radius:.5em;border-top-left-radius:.5em;opacity:.5;z-index:100;" data-loading="0" >loading</div>');
        $(document.body).append(loading);
        this.options.loading = $('#caldavloading');
      }
      $(this.options.loading).data('loading',0);
      return this; },

    getCalendars : function( ) { 
      $.fn.caldav('findMyPrincipal', function () {
        var finish = function () {
          var p = $.fn.caldav.principals;
          var c = []; 
          for ( var i=0; i < p.length; i++ )
          {
            if ( p[i].calendar != '' && c.indexOf ( p[i].calendar ) == -1 ) 
              c.push(p[i].calendar);
          }
          $.fn.caldav.starting = c.length;
          if ( debug ) 
            if ( c.length == 0 )
              alert ( 'no calendars found' );
          for ( var i = 0; i < c.length; i ++ )
          {
            if ( String(c[i]).length < 3 )
            {
              $.fn.caldav.starting--;
              if ( $.fn.caldav.starting == 0 )
              {
                $.fn.caldav('sortCalendarData');
                for ( var s in $.fn.caldav.collectionData )
                  for ( var r in $.fn.caldav.collectionData[s].supportedReports )
                    $.fn.caldav.reports[r] = true;
                if ( $.fn.caldav.options.calendars )
                  $.fn.caldav.options.calendars($.fn.caldav.calendarData);
              }
              continue;
            }
            $.fn.caldav('getCalendarData',{url:c[i]}, function () {
              $.fn.caldav.starting--;
              if ( $.fn.caldav.starting == 0 )
              {
                $.fn.caldav('sortCalendarData');
                for ( var s in $.fn.caldav.collectionData )
                  for ( var r in $.fn.caldav.collectionData[s].supportedReports )
                    $.fn.caldav.reports[r] = true;
                //$.fn.caldav.calendarData.sort (function(a,b){ console.log ('comparing ' + a.principal+ ' to ' + b.principal ); if ( a.principal != $.fn.caldav.data.myPrincipal) return 1; else if ( a.principal == $.fn.caldav.data.myPrincipal) return -1; else return 0; } );
                if ( $.fn.caldav.options.calendars )
                  $.fn.caldav.options.calendars($.fn.caldav.calendarData);
              }
            });
          }
        };
        if ( $.fn.caldav.options.fullDiscovery )
          $.fn.caldav('findDelagatedPrincipals', '' , finish );
        else
          finish();
      });
    },

    sortCalendarData : function ( ) {
      $.fn.caldav.calendarData.sort (function(a,b)
        { 
          var ret = 0; 
          if ( a.principal != $.fn.caldav.data.myPrincipal) 
            ret = 1; 
          else if ( a.principal == $.fn.caldav.data.myPrincipal) 
            ret = -1;
          return ret; 
        }
      );
    },

    getCalendarData : function( params, callback ) { 
      $.fn.caldav('spinner',true);
      var headers = {Depth:1};
      var bound = '';
      if ( $.fn.caldav.supports.bind )
      {
        headers['DAV'] = 'bind';
        bound = '<x0:resource-id/><x0:parent-set/>' + "\n"  ;
      }
      $.propfind ($.extend(true,{},jQuery.fn.caldav.options,params,{headers:headers,data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
      '<x0:propfind xmlns:x1="http://calendarserver.org/ns/" xmlns:x0="DAV:" xmlns:x3="http://apple.com/ns/ical/" xmlns:x2="urn:ietf:params:xml:ns:caldav" xmlns:x4="http://boxacle.net/ns/calendar/">' + "\n" +
      '<x0:prop>' + "\n" +
      '<x0:displayname/>' + "\n" +
      '<x2:calendar-description/>' + "\n" +
      '<x2:calendar-user-address-set/>' + "\n" +
      '<x2:calendar-inbox-URL/>' + "\n" +
      '<x2:calendar-outbox-URL/>' + "\n" +
      '<x3:calendar-color/>' + "\n" +
      '<x3:calendar-order/>' + "\n" +
      '<x4:calendar-settings/>' + "\n" +
      '<x4:calendar-subscriptions/>' + "\n" +
      '<x0:resourcetype/>' + "\n" +
      '<x0:acl/>' + "\n" +
      '<x0:owner/>' + "\n" + 
      '<x0:supported-privilege-set/>' + "\n" +
      '<x0:supported-report-set/>' + "\n" +
      '<x0:current-user-privilege-set/>' + "\n" + bound +
      '</x0:prop>' + "\n" +
      '</x0:propfind>' 
      ,complete: function (r,s){
        $.fn.caldav('spinner',false);
        if (s=='success')
        {
          $(this).caldav('parseCalendars',r);
        }
        else
        {
          if ( debug )
            console.log ( 'error getting calendar data for ' + params.url );
        }
          if ( typeof(callback) == 'function' )
            callback(r,s);
        return false;
      }
    })); return this; },


    parseCalendars : function (r, callback ) { 
      var pcalendars = $("*|resourcetype > *|collection",r.responseXML).closest('*|response'); 
      var rcalendars = $("*|resourcetype > *|calendar",r.responseXML).closest('*|response'); 
      var inboxes = $("*|resourcetype >    *|schedule-inbox",r.responseXML).closest('*|response'); 
      var outboxes = $("*|resourcetype >   *|schedule-outbox",r.responseXML).closest('*|response'); 
      var baseurl = jQuery.fn.caldav.options.url.replace(/(\/\/[.a-zA-Z0-9-])\/.*$/, '$1');
      var s =0;
      var write = false,read = false;
      var perms = new Array();
      if ( debug )
        console.log ( 'found ' + pcalendars.length + ' collections ' + rcalendars.length + ' calendars ' + inboxes.length + ' inboxes ' + outboxes.length + ' outboxes ',r.responseXML);
      if ( $.fn.caldav.collectionData && $.fn.caldav.collectionData.length > 0 )
        s = $.fn.caldav.collectionData.length;
      for (var i=0;i<inboxes.length;i++)
      {
        var cuprincipal = $.trim($("*|owner > *|href",inboxes[i]).text());
        var href = $("> *|href",inboxes[i]).text();
        $.fn.caldav.inboxMap[cuprincipal] = decodeURIComponent ( href );
      }
      for (var i=0;i<outboxes.length;i++)
      {
        var cuprincipal = $.trim($("*|owner > *|href",outboxes[i]).text());
        var href = $("> *|href",outboxes[i]).text();
        $.fn.caldav.outboxMap[cuprincipal] = decodeURIComponent ( href );
      }
      for (var i=0;i<pcalendars.length;i++)
      {
        var href = decodeURIComponent ( $("> *|href",pcalendars[i]).text() );
        if ( debug )
          console.log('processing principal ' + href );
        if ( $("*|resourcetype > *|webdav-binding",pcalendars[i]).length > 0 )
          continue;
        var cuprincipal = $.trim($("*|owner > *|href",pcalendars[i]).text());
        perms = new Object();
        $("*|current-user-privilege-set *|privilege *",pcalendars[i]).map(function(e){perms[String($(this)[0].localName).toLowerCase()]=true});
        if ( perms.all && ! perms.read )
          perms.read = true;
        if ( perms.all && ! perms.write )
          perms.write = true;
        var supportedreports = $('*|supported-report-set *|report > *',pcalendars[i]);
        var reports = {};
        for (var j=0;j<supportedreports.length;j++)
        {
          reports[supportedreports[j].localName] = supportedreports[j].localName;
        }
        $.fn.caldav.collectionData[s+i] = { xml: $(pcalendars[i]).clone(true),
        displayName: $("*|displayname",pcalendars[i]).text(),
        href: href, 
        supportedReports: reports,
        url: ($("> *|href",pcalendars[i]).text().match(/^\//) ?
            baseurl.replace(/^(https?:\/\/[^\/]+).*$/,'$1') + $("> *|href",pcalendars[i]).text() : $("> *|href",pcalendars[i]).text()),
        mailto: $("*|href:contains('mailto:')",pcalendars[i]).text().replace(/^mailto:/i,''),
        desc: $(pcalendars[i]).find("calendar-description").text(),
        ctag: $("*|getctag",pcalendars[i]).text(),
        principal: cuprincipal, 
        perms:perms,
        xml: $(pcalendars[i]).clone(),
        color: $(pcalendars[i]).find("*|calendar-color").text().replace (/(#......)../,'$1'),
        order: $(pcalendars[i]).find("*|calendar-order").text(),};
        if ( $.fn.caldav.principalMap[cuprincipal] != undefined )
          $.fn.caldav.collectionData[s+i].principalName = $.fn.caldav.principals[$.fn.caldav.principalMap[cuprincipal]].name;
        if ( href != '' )
        {
          if ( $.fn.caldav.principalMap[href] != undefined ) 
            $.fn.caldav.principals[$.fn.caldav.principalMap[href]].cal = s+i;
        }
      }
      s =0;
      if ( $.fn.caldav.calendarData && $.fn.caldav.calendarData.length > 0 )
        s = $.fn.caldav.calendarData.length;
      for (var i=0;i<rcalendars.length;i++)
      {
        var cuprincipal = decodeURIComponent ( $.trim($("*|owner > *|href",rcalendars[i]).text()) ); 
        var href = decodeURIComponent ( $("> *|href",rcalendars[i]).text() );
        var bound = false;
        var parents = false;
        if ( $("*|resourcetype > *|webdav-binding",rcalendars[i]).length > 0 )
        {
          cuprincipal = href.replace(/\/[^\/]*\/?$/,'/');
          bound = $(rcalendars[i]).find("*|resource-id *|href:first").text();
          parents = $(rcalendars[i]).find("*|parentset").clone();
        }
        perms = new Object();
        $("*|current-user-privilege-set *|privilege *",rcalendars[i]).map(function(e){perms[String($(this)[0][$.fn.caldav.xmlNSfield]).toLowerCase()]=true});
        if ( perms.all && ! perms.read )
          perms.read = true;
        if ( perms.all && ! perms.write )
          perms.write = true;

        $.fn.caldav.calendarData[s+i] = {// xml: $(rcalendars[i]).clone(true),
        displayName: $("*|displayname",rcalendars[i]).text(),
        href: href,
        url: ($("> *|href",rcalendars[i]).text().match(/^\//) ?
            $("> *|href",rcalendars[i]).text() : baseurl.replace(/^(https?:\/\/[^\/]+).*$/,'$1') + $("> *|href",rcalendars[i]).text() ),
        mailto: $("*|href:contains('mailto:')",rcalendars[i]).text().replace(/^mailto:/i,''),
        desc: $(rcalendars[i]).find("*|calendar-description").text(),
        ctag: $("*|getctag",rcalendars[i]).text(),
        principal: cuprincipal, 
        bound: bound,
        owner: $("*|owner *|href",rcalendars[i]).text(),
        parents: parents,
        perms: perms,
        xml: $(rcalendars[i]).clone(true),
        color: $(rcalendars[i]).find("*|calendar-color").text().replace (/(#......)../,'$1'),
        order: $(rcalendars[i]).find("*|calendar-order").text(),};
        if ( $.fn.caldav.principalMap[cuprincipal] != undefined )
          $.fn.caldav.calendarData[s+i].principalName = $.fn.caldav.principals[$.fn.caldav.principalMap[cuprincipal]].name;
        //$.fn.caldav.principals[$.fn.caldav.principalMap[href]].cal = s+i;
      }
      if ( $.fn.caldav.calendarXml == undefined )
        $.fn.caldav.calendarXml = $(r.responseXML.documentElement).clone();
      else
        $($.fn.caldav.calendarXml).append($("response",r.responseXML).clone());
      //$.fn.caldav.calendarData.sort (function(a,b){ console.log ('comparing ' + a.principal+ ' to ' + b.principal ); if ( a.principal != $.fn.caldav.data.myPrincipal) return 1; else if ( a.principal == $.fn.caldav.data.myPrincipal) return -1; else return 0; } );
      return this;
    },
  
    findMyPrincipal: function (callback){
      $.fn.caldav('spinner',true);
        // DCS report on '<D:principal-match xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav"><D:self/><D:prop><D:displayname/><C:calendar-home-set/><C:calendar-user-address-set/></D:prop></D:principal-match>',
  //    $.propfind ($.extend(true,{},$.fn.caldav.options,{url:'/davical/htdocs/caldav.php/',headers:{Depth:1},data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
//'<propfind xmlns="DAV"><prop><principal-collection-set/><current-user-principal/></prop></propfind>',
      var headers = {Depth:0};
      if ( $.fn.caldav.supports['bind'] )
        headers['DAV'] = 'bind';
      $.propfind ($.extend(true,{},$.fn.caldav.options,{headers:headers,data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
        '<propfind xmlns="DAV:"><prop><principal-collection-set/><current-user-principal/><calendar-description xmlns="urn:ietf:params:xml:ns:caldav" /></prop></propfind>',
        complete: function (r,s)
        {
          $.fn.caldav('spinner',false);
          if (s=='success')
          {
            $.fn.caldav.serverSupports = r.getResponseHeader('Dav');
            var splits = String($.fn.caldav.serverSupports).split(',');
            for ( var i in splits )
              $.fn.caldav.supports[$.trim(splits[i])] = true;
            $.fn.caldav.requestcount = 0;
            if ( r.responseXML.firstChild.baseName )
              $.fn.caldav.xmlNSfield = 'baseName';
            if ( jQuery.fn.caldav.data == undefined )
              jQuery.fn.caldav.data = {};
            if ( $('*|principal-collection-set > *|href',r.responseXML).length > 0 )
              $.fn.caldav.data.principalCollection = decodeURIComponent ( $.trim($('*|principal-collection-set > *|href',r.responseXML).text()) );
            else
              $.fn.caldav.data.principalCollection = decodeURIComponent ( $.trim($('*|response > *|href:first',r.responseXML).text()) );
            $.fn.caldav.data.myPrincipal = decodeURIComponent ( $.trim($('*|current-user-principal > *|href:first',r.responseXML).text()) )
              //).replace ( /(.)\/$/, '$1' );
            if ( ! $.fn.caldav.options.fullDiscovery && $.fn.caldav.data.myPrincipal.match(/\//) ) 
            {
              $.fn.caldav.requestcount++;
              $.fn.caldav('getPrincipalData',$.fn.caldav.data.myPrincipal,callback);
              return ;
            }
              $.fn.caldav('spinner',true);
              if ( $.fn.caldav.options.fullDiscovery )
                var depth = 1;
              else
                var depth = 0;
              $.propfind ($.extend(true,{},$.fn.caldav.options,{url:$.fn.caldav.data.principalCollection,headers:{Depth:depth},data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
                '<propfind xmlns="DAV:"><prop><current-user-principal/><displayname/><calendar-description xmlns="urn:ietf:params:xml:ns:caldav" /></prop></propfind>',
                complete: function (r,s)
                {
                  $.fn.caldav('spinner',false);
                  var results = $('*|response',r.responseXML);
                  $.fn.caldav.data.myPrincipal = decodeURIComponent ( String ( $.trim($('*|current-user-principal > *|href:first',r.responseXML).text()) )
                    ).replace ( /\/$/, '' );
                  if ( $('*|href:first:contains('+$.fn.caldav.data.myPrincipal+')',r.responseXML).length == 0 )
                  {
                    $.fn.caldav.requestcount++;
                    $.fn.caldav('getPrincipalData',$.fn.caldav.data.myPrincipal,callback);
                  }
                  if ( $.fn.caldav.options.fullDiscovery )
                    return;
                  for ( var i = 0; i < results.length; i++ )
                  {
                    var href = decodeURIComponent ( $('*|href:first',results[i]).text() );
                    if ( $.fn.caldav.principalMap[href] != undefined )
                      continue ;
                    if ( debug ) 
                      console.log ( ' adding principal ' + href + ' named ' + $.trim($("displayname",results[i]).text()) );
                    $.fn.caldav.principals.push({
                      href:href,
                      name:$.trim($("*|displayname",results[i]).text()),
                      desc:$.trim($("*|calendar-description",results[i]).text())
                    });
                    var m = $.fn.caldav.principals.length-1;
                    $.fn.caldav.principalMap[href] = m;
                    $.fn.caldav.requestcount++;
                    $.fn.caldav('getPrincipalData',href,callback);
                  }
                }
              }));
          }
          else
          {
            if ( r.status == 0 )
              //alert ( 'jqcaldav must be served from the same host and port as your caldav server' );
              console.log('login failed, bad username and password or not served from the same host and port as your caldav server');
            else
              alert ( r.status + ' login failed, bad username and password or not served from the same host and port as your caldav server');
          }
        }
      }));
    },

    getPrincipalData: function (url,callback){
      $.fn.caldav('spinner',true);
      var headers = {Depth:1};
      if ( $.fn.caldav.supports.bind )
        headers['DAV'] = 'bind';
      $.propfind ($.extend(true,{},$.fn.caldav.options,{url:url,headers:headers,data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
          '<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:C2="http://calendarserver.org/ns/"><D:prop><D:displayname/><C:calendar-home-set/><C:calendar-user-address-set/><C:calendar-description/><C2:calendar-proxy-write/><C2:calendar-proxy-read/><C2:calendar-proxy-write-for/><C2:calendar-proxy-read-for/><D:resourcetype/></D:prop></D:propfind>',
        complete: function (r,s)
        {
          $.fn.caldav('spinner',false);
          try 
          {
            var ph = $('*|calendar-user-address-set > *|href:contains('+$.fn.caldav.data.myPrincipal+')',r.responseXML).filter(function(i){if ($(this).text()==$.fn.caldav.data.myPrincipal)return true; else return false;});
            if ( $(ph).length > 0 )
            {
              var me = $(ph).parent().parent();
              jQuery.fn.caldav.data.principalDisplayName = $.trim($("*|displayname",me).text());
              jQuery.fn.caldav.data.principalHome        = $.trim($("*|calendar-home-set:first",me).text());
            }
            
            var results = $('*|response',r.responseXML);
            for ( var i = 0; i < results.length; i++ )
            {
              var href = decodeURIComponent ( $('> *|href:first',results[i]).text() );
              if ( debug )
                console.log('getPrincipalData found principal ' + href , results[i] );
              if ( $.fn.caldav.principalMap[href] == undefined )
                $.fn.caldav.principalMap[href] = $.fn.caldav.principals.length;
              var calendar = decodeURIComponent ( $.trim($("*|calendar-home-set:first",results[i]).text()) );
              if ( $("*|webdav-binding:first",results[i]).length > 0 )
                var calendar = href.replace(/\/[^\/]*\/?$/,'/');
              if ( $.fn.caldav.principalMap[calendar] == undefined )
                $.fn.caldav.principalMap[calendar] = $.fn.caldav.principals.length;
              $.fn.caldav.principals[$.fn.caldav.principalMap[href]] ={
                href:href,
                calendar:calendar,
                name:$.trim($("*|displayname",results[i]).text()),
                calendarHome:$.trim($("*|calendar-home-set:first",results[i]).text()),
                desc:$.trim($("*|calendar-description",results[i]).text()),
                email:$.trim($("*|href:contains('mailto:')",results[i]).text()).replace(/^mailto:/i,'')
              };
              var addresses = $("*|calendar-user-address-set > *|href",results);
              for ( var j = 0; j < addresses.length; j++ )
              {
                if ( $.fn.caldav.principalMap[decodeURIComponent($(addresses[j]).text())] == undefined && String($(addresses[j]).text()).length > 1 )
                  $.fn.caldav.principalMap[decodeURIComponent($(addresses[j]).text())] = $.fn.caldav.principalMap[href];
              }
            }
            var proxywrite  = $("*|calendar-proxy-write-for:first *|href", r.responseXML);
            var proxyread   = $("*|calendar-proxy-read-for:first  *|href", r.responseXML);
            var proxy  = $(proxywrite,proxyread);
            for ( var i = 0; i < proxy.length; i++ )
            {
              var u = decodeURIComponent($(proxy[i]).text());
              if ( $.fn.caldav.principalMap[u] == undefined )
              {
                $.fn.caldav.requestcount++;
                $.fn.caldav('getPrincipalData',u,callback);
              }
            }
          //$.fn.caldav.principalMap[$.trim($('response > href',r.responseXML).text())] = $.fn.caldav.principals[$.fn.caldav.principals.length-1];
          } catch (e) {};
          $.fn.caldav.requestcount--;
          if ( $.fn.caldav.requestcount == 0 && typeof(callback) == 'function' )
            callback(r,s);
        }
      }));
     },

    findDelagatedPrincipals: function (url,callback){
      if ( ! String(url).match(/\//) ) 
        url = $.fn.caldav.data.myPrincipal;
      $.fn.caldav('spinner',true);
      $.report ($.extend(true,{},$.fn.caldav.options,{url:url,headers:{DAV:'bind'},data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
'<expand-property xmlns="DAV:">' +
' <property name="calendar-proxy-write-for" xmlns="http://calendarserver.org/ns/"><property name="displayname"/><property name="principal-URL"/><property name="calendar-user-address-set" xmlns="urn:ietf:params:xml:ns:caldav"/></property>' +
' <property name="calendar-proxy-read-for" xmlns="http://calendarserver.org/ns/"><property name="displayname"/><property name="principal-URL"/><property name="calendar-user-address-set" xmlns="urn:ietf:params:xml:ns:caldav"/></property>' +
'</expand-property>',
        complete: function (r,s)
        {
          $.fn.caldav('spinner',false);
          if (s=='success')
          {
            var results = $('*|response',r.responseXML);
            for ( var i = 0; i < results.length; i++ )
            {
              var href = decodeURIComponent($.trim($(results[i]).children('*|href:first').text()));
              if ($.fn.caldav.principalMap[href] != undefined )
                continue;
              $.fn.caldav.principals.push({
                href:href,
                calendar:decodeURIComponent($.trim($("["+$.fn.caldav.xmlNSfield+"=calendar-home-set]:first",r.responseXML).text())),
                name:$.trim($("["+$.fn.caldav.xmlNSfield+"=displayname]",results[i]).text()),
                email:$.trim($("*|href:contains('mailto:')",results[i]).text()).replace(/^mailto:/i,'')
              });
              $.fn.caldav.principalMap[href] = $.fn.caldav.principals.length-1;
            }
            if ( typeof(callback) == 'function' )
              callback(r,s);
          }
        },
        error: function (r,s){$.fn.caldav('spinner',false);}
      }));
    },

    calendars : function( ) {  
      return $.fn.caldav.calendarData;
    },  

    principals : function( ) {  
      return $.fn.caldav.principals;
    },  
    
    searchPrincipals: function ( params, property ,name, callback ) { 
      $.fn.caldav('spinner',true);
      $.report ($.extend(true,{},$.fn.caldav.options,params,{url:$.fn.caldav.data.principalCollection,data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
        '<x1:principal-property-search xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:">'+
        '<x1:property-search>'+
        '<x1:prop>'+
        '<x1:'+ property +'/>'+
        '</x1:prop>'+
        '<x1:match>'+ name +'</x1:match>'+
        '</x1:property-search>'+
        '<x1:prop>'+
        '<x1:displayname/>'+
        '<x0:calendar-user-address-set/>'+
        '</x1:prop>'+
        '</x1:principal-property-search>'
        ,complete: function (r,s){ 
          $.fn.caldav('spinner',false);
                if (s=='success')
                {
                  $(this).caldav('gotPrincipals',r,callback);
                } 
              },
        error: function (r,s){$.fn.caldav('spinner',false);}
      }));
      return this;
    },

    gotPrincipals: function (r, callback ) { 
      var entries = $('multistatus',r.responseXML).clone(true);
      if ( entries.length > 0 && typeof(callback) == 'function' )
        callback(entries);
      return this;
    },

    // properties should be an object with the properties names as the name with the namespace as the value
    // eg properties = { 'displayname': 'DAV:' }
    getProperties: function ( params, properties, callback ) { 
      $.fn.caldav('spinner',true);
      var namespaces = {'DAV:':'x0'};
      var count = 1, props = '',ns='xmlns:x0="DAV:" ';
      for ( var i in properties )
      {
        if ( namespaces[properties[i]] == undefined ) 
        {
          namespaces[properties[i]] = 'x' + count;
          ns = ns + 'xmlns:x' + count + '="' + properties[i] + '" ';
          count++;
        }
        props = props + '<' + namespaces[properties[i]] + ':' + i + '/>';
      }
      if ( params.headers == undefined )
        params.headers={Depth:0};
      $.propfind ($.extend(true,{},$.fn.caldav.options,params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
        '<x0:propfind '+ns+'>'+
        '  <x0:prop>'+
        props +
        '  </x0:prop>'+
        '</x0:propfind>'
        ,complete: function (r,s){ 
            $.fn.caldav('spinner',false);
                if (s=='success')
                  $(this).caldav('gotProperties',r,callback);
              },
        error: function (r,s){$.fn.caldav('spinner',false);}
      }));
      return this;
    },

    gotProperties: function (r, callback ) { 
      var entries = $('multistatus',r.responseXML).clone(true);
      if ( entries.length > 0 && typeof(callback) == 'function' )
        callback(entries);
      return this;
    },
    
    bind: function ( resource, into , from ) {
      $.fn.caldav('spinner',true);
      $.bind ($.extend(true,{},$.fn.caldav.options,{url:into,data:'<?xml version="1.0" encoding="utf-8"?>'+"\n"+'<dav:bind xmlns:dav="DAV:">'+"\n"+'<dav:segment>' + resource + '</dav:segment><dav:href>' + from + '</dav:href></dav:bind>' + "\n",
              complete: function (r,s){
                $.fn.caldav('spinner',false);
              }}));
    },

    unbind: function ( resource, from ) {
      var xml = '<?xml version="1.0" encoding="utf-8" ?>\n<D:unbind xmlns:D="DAV:">\n<D:segment>' + resource + '</D:segment>\n</D:unbind>';
      var url = from;
      $.fn.caldav('spinner',true);
      $.unbind ($.extend(true,{},$.fn.caldav.options,{url:url,data:xml,
              complete: function (r,s){
                $.fn.caldav('spinner',false);
              }}));
    },

    getEvents: function ( params, start, end, cal ) { 
      if ( $.fn.caldav.coalesceEvents[cal] == undefined  )
        $.fn.caldav.coalesceEvents[cal] = {params:params,start:start,end:end};
      else
      {
        if ( $.fn.caldav.coalesceEvents[cal].start > start )
          $.fn.caldav.coalesceEvents[cal].start = start;
        if ( $.fn.caldav.coalesceEvents[cal].end < end )
          $.fn.caldav.coalesceEvents[cal].end = end;
      }
      if ( ! $.fn.caldav.coalesceEvents[cal].timeout )
      {
        var delayedCall =  function (cal){ 
          $.fn.caldav('getCoalescedEvents',
            $.fn.caldav.coalesceEvents[cal].params,
            $.fn.caldav.coalesceEvents[cal].start,
            $.fn.caldav.coalesceEvents[cal].end,
            cal); delete $.fn.caldav.coalesceEvents[cal]; };//.cal = cal;
        //var boundCall = delayedCall.bind(this); 
        $.fn.caldav.coalesceEvents[cal].timeout = window.setTimeout (function (){delayedCall(cal)},$.fn.caldav.eventAverageTime);
      }
      return this;
    },

    getCoalescedEvents: function ( params, start, end, cal ) {
      var requestTiming = new Date().getTime();
      $.fn.caldav('spinner',true);
      $.report ($.extend(true,{},$.fn.caldav.options,params,{headers:{depth:1},data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
        '<x0:calendar-query xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:">'+
        '  <x1:prop>'+
        '    <x0:calendar-data/>'+
        '    <x1:resourcetype/>'+
        '    <x1:getetag/>'+
        '  </x1:prop>'+
        '  <x0:filter>'+
        '    <x0:comp-filter name="VCALENDAR">'+
        '      <x0:comp-filter name="VEVENT">'+
        '        <x0:time-range start="'+ $.fn.caldav('formatDate',start) +'" end="'+ $.fn.caldav('formatDate',end) +'"/>'+
        '      </x0:comp-filter>'+
        '    </x0:comp-filter>'+
        '  </x0:filter>'+
        '</x0:calendar-query>'
        ,complete: function (r,s){ $.fn.caldav.eventTiming.push(new Date().getTime() - requestTiming); 
        if ( $.fn.caldav.eventTiming.length > $.fn.caldav.calendarData.length * 2 ) { var at =0; for ( var i=0;i<$.fn.caldav.eventTiming.length;i++)at+=$.fn.caldav.eventTiming[i];
          $.fn.caldav.eventAverageTime = at / $.fn.caldav.eventTiming.length;
          var trash = $.fn.caldav.eventTiming.shift();}
          if ( cal != undefined ) { r.cal = 0 + cal; }
          $.fn.caldav('spinner',false);
          if (s=='success')
          {
            if (  $('*|response *|prop *|calendar-data',r.responseXML).closest('*|propstat').find('*|status').text().match(/404/) )
            {
              var hrefs = [];
              var updates = $('*|href',r.responseXML);
              for ( var i=0; i< updates.length; i++ )
                hrefs.push($(updates[i]).text());
              $(this).caldav( 'multiget', params.url, cal, hrefs, start, end );
            }
            else
              $(this).caldav( 'parseEvents', r, start, end );
          } 
        },
        error: function (r,s){$.fn.caldav('spinner',false);}
      }));
      return this;
    },

    parseEvents : function ( r, start, end, callback) { 
      var entries = r.responseXML.getElementsByTagNameNS("urn:ietf:params:xml:ns:caldav",'calendar-data');
      var e = new Array;
      var href,etag;
      for (var i=0;i<entries.length;i++)
      {
        href = $("*|href",$(entries[i]).closest('*|response')).text();
        etag = $("*|getetag",$(entries[i]).closest('*|response')).text();
        if ( href.length > 0 )
        {
          $.fn.caldav.entries[href] = $(entries[i]).text();
          e[i] = { href: href, text: $(entries[i]).text(), etag: etag };
        }
      }
      if ( e.length > 0 )
      {
        if ( typeof callback == "function" )
          callback( e ,r.cal, start, end );
        else
          $.fn.caldav.options.events( e ,r.cal, start, end );
      }
      return this;
    },

    getAll: function ( params, callback, types, inbox ) {
      var requestTiming = new Date().getTime();
      $.fn.caldav('spinner',true);
      if ( inbox == undefined )
        var url = inbox;
      else
        var url = $.fn.caldav.inboxMap[$.fn.caldav.data.myPrincipal];
      var tt=[],t = '<x0:comp-filter name="VEVENT"></x0:comp-filter>';
      if ( types != undefined )
      {
        if ( typeof types != "object" ) 
          tt.push(types);
        else 
          tt=types;
        t= '';
        for ( var i = 0; i < tt.length; i++)
          t=t+ '<x0:comp-filter name="'+tt[i]+'"></x0:comp-filter>';
      }
      $.report ($.extend(true,{},$.fn.caldav.options,params,{url:url,headers:{depth:1},data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
        '<x0:calendar-query xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:">'+
        '  <x1:prop>'+
        '    <x0:calendar-data/>'+
        '    <x1:resourcetype/>'+
        '    <x1:getetag/>'+
        '  </x1:prop>'+
        '  <x0:filter>'+
        '    <x0:comp-filter name="VCALENDAR">'+t+
        '    </x0:comp-filter>'+
        '  </x0:filter>'+
        '</x0:calendar-query>'
        ,complete: function (r,s){ 
          //if ( cal != undefined ) { r.cal = 0 + cal; }
          $.fn.caldav('spinner',false);
          if (s=='success')
          {
            cal = undefined;
            if (  $('*|response *|prop *|calendar-data',r.responseXML).closest('*|propstat').find('*|status').text().match(/404/) )
            {
              var hrefs = [];
              var updates = $('*|href',r.responseXML);
              for ( var i=0; i< updates.length; i++ )
                hrefs.push($(updates[i]).text());
              $(this).caldav( 'multiget', params.url, cal, hrefs, undefined, undefined, callback );
            }
            else
              $(this).caldav( 'parseEvents', r, undefined, undefined, callback );
          } 
        },
        error: function (r,s){$.fn.caldav('spinner',false);}
      }));
      return this;
    },

    getInvites: function ( params, callback, address ) {
      var requestTiming = new Date().getTime();
      $.fn.caldav('spinner',true);
      $.report ($.extend(true,{},$.fn.caldav.options,params,{headers:{depth:1},data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
        '<x0:calendar-query xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:">'+
        '  <x1:prop>'+
        '    <x0:calendar-data/>'+
        '    <x1:resourcetype/>'+
        '    <x1:getetag/>'+
        '  </x1:prop>'+
        '  <x0:filter>'+
        '    <x0:comp-filter name="VCALENDAR">'+
        '      <x0:comp-filter name="VEVENT">'+
        '        <x0:prop-filter name="ATTENDEE">'+
        (address?'             <C:text-match collation="i;ascii-casemap">'+address+'</C:text-match>':'')+
        '          <x0:param-filter name="PARTSTAT">'+
        '             <x0:text-match collation="i;ascii-casemap">NEEDS-ACTION</x0:text-match>' +
        '          </x0:param-filter>'+
        '        </x0:prop-filter>'+
        '      </x0:comp-filter>'+
        '    </x0:comp-filter>'+
        '  </x0:filter>'+
        '</x0:calendar-query>'
        ,complete: function (r,s){ $.fn.caldav.eventTiming.push(new Date().getTime() - requestTiming); 
        if ( $.fn.caldav.eventTiming.length > $.fn.caldav.calendarData.length * 2 ) { var at =0; for ( var i=0;i<$.fn.caldav.eventTiming.length;i++)at+=$.fn.caldav.eventTiming[i];
          $.fn.caldav.eventAverageTime = at / $.fn.caldav.eventTiming.length;
          var trash = $.fn.caldav.eventTiming.shift();}
          if ( cal != undefined ) { r.cal = 0 + cal; }
          $.fn.caldav('spinner',false);
          if (s=='success')
          {
            if (  $('*|response *|prop *|calendar-data',r.responseXML).closest('*|propstat').find('*|status').text().match(/404/) )
            {
              var hrefs = [];
              var updates = $('*|href',r.responseXML);
              for ( var i=0; i< updates.length; i++ )
                hrefs.push($(updates[i]).text());
              $(this).caldav( 'multiget', params.url, cal, hrefs, start, end, callback );
            }
            else
              $(this).caldav( 'parseEvents', r, start, end, callback );
          } 
        },
        error: function (r,s){$.fn.caldav('spinner',false);}
      }));
      return this;
    },

    syncCollection: function ( cal, start, end )
    { 
      if ( ! $.fn.caldav.calendarData[cal] || ! $.fn.caldav.reports['sync-collection'] )
        return;
      var params = {url:$.fn.caldav.calendarData[cal].href,cal:cal,start:start,end:end };
      if ( ! $.fn.caldav.calendarData[cal].synctoken )
        var data = '<?xml version="1.0" encoding="utf-8"?>' + "\n" +
          '<D:sync-collection xmlns:D="DAV:"><D:sync-token/><D:limit><D:nresults>1</D:nresults></D:limit><D:prop><D:getetag/></D:prop></D:sync-collection>';
      else
        var data = '<?xml version="1.0" encoding="utf-8"?>' + "\n" +
          '<D:sync-collection xmlns:D="DAV:"><D:sync-token>'+$.fn.caldav.calendarData[cal].synctoken+'</D:sync-token><D:prop><D:getetag/></D:prop></D:sync-collection>';
      $.report ($.extend(true,{},$.fn.caldav.options,params,{headers:{depth:1},data:data,
        complete: function (r,s) { $.fn.caldav('gotSyncData',r,s,cal,start,end);}}));
    },
    
    gotSyncData: function (r,s,cal,start,end)
    {
      var url = r.url;
      if ( $.fn.caldav.calendarData[cal].synctoken && $('*|href',r.responseXML).length > 0 )
      {
        var hrefs = [];
        var updates = $('*|href',r.responseXML);
        for ( var i=0; i< updates.length; i++ )
        {
          if ( ! String($(updates[i]).siblings('*|status').text()).match(/404/) ) 
            hrefs.push($(updates[i]).text());
          else
            if ( typeof($.fn.caldav.options.eventDel) == "function" )
              $.fn.caldav.options.eventDel($(updates[i]).text());
        }
        if ( hrefs.length > 0 )
          $(this).caldav( 'multiget', url, cal, hrefs, start, end );
      }
      $.fn.caldav.calendarData[cal].synctoken = $('sync-token',r.responseXML).text(); 
      //debug.log(r);
    },

    multiget: function ( url, cal, hrefs, start, end ) { 
        var multiget = '<?xml version="1.0" encoding="utf-8"?>' + "\n" +
              '<x0:calendar-multiget xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:"><x1:prop><x0:calendar-data/><x1:getetag/></x1:prop>';
            for ( var i=0; i< hrefs.length; i++ )
              multiget = multiget + '<x1:href>'+hrefs[i]+'</x1:href>';
            multiget = multiget + '</x0:calendar-multiget>';
            $.report ($.extend(true,{},$.fn.caldav.options,{url:$.fn.caldav.calendarData[cal].href,headers:{depth:1},data:multiget,
              complete: function (r,s){
                $.fn.caldav('spinner',false);
                if ( cal != undefined ) { r.cal = 0 + cal; }
                if (s=='success')
                  $(this).caldav( 'parseEvents', r, start, end );
              }}));
    },

    getToDos: function ( params, cal ) { 
      if ( debug )
        console.log( ' requesting todos for calendar('+cal+') href: ' + params.url );

      $.fn.caldav('spinner',true);
      $.report ($.extend(true,{},$.fn.caldav.options,params,{headers:{depth:1},data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
        '<x0:calendar-query xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:"><x1:prop><x0:calendar-data/><x1:resourcetype/></x1:prop><x0:filter><x0:comp-filter name="VCALENDAR"><x0:comp-filter name="VTODO"></x0:comp-filter></x0:comp-filter></x0:filter></x0:calendar-query>'
        ,complete: function (r,s){ if ( cal != undefined ) { r.cal = 0 + cal; }
          $.fn.caldav('spinner',false);
          if (s=='success')
            $(this).caldav('parseTodos',r);
        }
      }));
      return this;
    },

    parseTodos : function (r ) { 
      var entries = $('*|response *|prop *|calendar-data',r.responseXML);
      var e = new Array;
      for (var i=0;i<entries.length;i++)
      {
        href = $("*|href",$(entries[i]).closest('*|response')).text();
        if ( href.length > 0 )
        {
          $.fn.caldav.entries[href] = $(entries[i]).text();
          e[i] = { href:href,text: $(entries[i]).text()};
        }
      }
      if ( e.length > 0 )
        $.fn.caldav.options.todos(e,r.cal);
      return this;
    },
  
    updateCollection: function ( params, cal, props ) { 
      var ns = 'xmlns:x1="http://apple.com/ns/ical/"';
      var nsArray = ["DAV:","http://apple.com/ns/ical/"];
      var str = '';
      for ( var i in props )
      {
        if ( props[i].ns != undefined )
        {
          if ( nsArray.indexOf(props[i].ns) == -1 )
          { 
            n = nsArray.length; 
            ns = ns + ' xmlns:x' + n + '="' + props[i].ns + '"';
            nsArray.push(props[i].ns); 
          }
          else
          {
            n = nsArray.indexOf(props[i].ns);
          }
          str = str + '<x'+n+':'+props[i].name+'>'+props[i].value+'</x'+n+':'+props[i].name+'>';
        }
        else
          n = 0;
      }
      if ( $.fn.caldav.calendarData[cal] != undefined )
        var url=$.fn.caldav.calendarData[cal].href;
      else
        var url=cal;
      $.proppatch ($.extend(true,{},$.fn.caldav.options,{url:url},params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
        '<x0:propertyupdate xmlns:x0="DAV:" '+ns+'>'+
          '<x0:set>'+
            '<x0:prop>'+
              str +
            '</x0:prop>'+
          '</x0:set>'+
        '</x0:propertyupdate>'
        ,complete: function (r,s){
          $.fn.caldav('spinner',false);
          if (s=='success')
            $(this).caldav('updated',r);
        }
      }));
      return this;
    },

    setACL: function ( params, cal, props ) { 
      var ns = 'xmlns:x1="urn:ietf:params:xml:ns:caldav"';
      var nsArray = ["DAV:","urn:ietf:params:xml:ns:caldav"];
      var str = '';
      for ( var i in props )
      {
        if ( props[i].ns != undefined )
        {
          if ( nsArray.indexOf(props[i].ns) == -1 )
          { 
            n = nsArray.length; 
            ns = ns + ' xmlns:x' + n + '="' + props[i].ns + '"';
            nsArray.push(props[i].ns); 
          }
          else
          {
            n = nsArray.indexOf(props[i].ns);
          }
          str = str + '<x'+n+':'+props[i].name+'>'+props[i].value+'</x'+n+':'+props[i].name+'>';
        }
        else
          n = 0;
      }
      if ( $.fn.caldav.calendarData[cal] != undefined )
        var url=$.fn.caldav.calendarData[cal].href;
      else
        var url=cal;
      $.proppatch ($.extend(true,{},$.fn.caldav.options,{url:url},params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
        '<x0:acl xmlns:x0="DAV:" '+ns+'>'+
          '<x0:ace>'+
            '<x0:prop>'+
              str +
            '</x0:prop>'+
          '</x0:ace>'+
        '</x0:acl>'
        ,complete: function (r,s){
          if (s=='success')
            $(this).caldav('updated',r);
        }
      }));
      return this;
    },

    lock: function ( url, timeout, callback ) { 
      if ( ! /2/.test ( $.fn.caldav.serverSupports ) )
        return false;
      var to = timeout?timeout:600;
      var data = '<?xml version="1.0" encoding="utf-8"?>' + "\n" +
        '<D:lockinfo xmlns:D="DAV:">'+
          '<D:lockscope><D:exclusive/></D:lockscope>'+
            '<D:locktype><D:write/></D:locktype>'+
            '<D:owner>'+
              '<D:href>'+$.fn.caldav.data.myPrincipal +'</D:href>'+
            '</D:owner>'+
        '</D:lockinfo>';
      $.lock ($.extend(true,{},$.fn.caldav.options,{url:url},{headers:{Depth:0,Timeout:'Second-'+to},contentType:'text/xml; charset="utf-8"',
              data:data,complete: function (r,s){
          if (s=='success')
          {
            if ( r.status == 200 || r.status == 201 )
            { 
              var to = Number(String($("["+$.fn.caldav.xmlNSfield+"=timeout]",r.responseXML).text()).replace(/second-/i,''));
              var cancel = window.setTimeout (function(){delete $.fn.caldav.locks[url];},to*1000);
              $.fn.caldav.locks[url] = {token:r.getResponseHeader('Lock-Token'),timeout:to,taken:$.now(),unsetlock:cancel };
              callback(true,r,s);
            }
            else
              if ( typeof(callback) == 'function' )
                callback(false,r,s);
          }
          else
            if ( typeof(callback) == 'function' )
              callback(false,r,s);
        }
      }));
      return true;
    },
    
    unlock: function ( url ) { 
      if ( ! /2/.test ( $.fn.caldav.serverSupports ) )
        return false;
      if ( $.fn.caldav.locks[url] && $.fn.caldav.locks[url].timeout > ( $.now() - $.fn.caldav.locks[url].taken ) / 1000 )
        var token = $.fn.caldav.locks[url].token;
      else
        return ;
      window.clearTimeout($.fn.caldav.locks[url].unsetlock);
      $.unlock ($.extend(true,{},$.fn.caldav.options,{url:url},{headers:{'Lock-Token':token},
        complete: function (r,s){
          if (s!='success')
          {
            r.abort();
            return false;
          }
        }
      }));
    },

    makeCalendar: function ( params, cal, props ) { 
      var ns = 'xmlns:x2="http://apple.com/ns/ical/"';
      var nsArray = ["urn:ietf:params:xml:ns:caldav","DAV:","http://apple.com/ns/ical/"];
      var str = '';
      for ( var i in props )
      {
        if ( props[i].ns != undefined )
        {
          if ( nsArray.indexOf(props[i].ns) == -1 )
          { 
            n = nsArray.length; 
            ns = ns + ' xmlns:x' + n + '="' + props[i].ns + '"';
            nsArray.push(props[i].ns); 
          }
          else
          {
            n = nsArray.indexOf(props[i].ns);
          }
          str = str + '<x'+n+':'+props[i].name+'>'+props[i].value+'</x'+n+':'+props[i].name+'>';
        }
        else
          n = 0;
      }
      if ( $.fn.caldav.supports['extended-mkcol'] )
      {
        $.mkcol ($.extend(true,{},$.fn.caldav.options,params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
          '<x1:mkcol xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:" '+ns+'>'+
          " <x1:set>\n"+
          "   <x1:prop>\n"+
          "     <x1:resourcetype>\n"+
          "       <x1:collection/>\n"+
          "       <x0:calendar/>\n"+
          "     </x1:resourcetype>\n"+
            str +
          '      <x0:supported-calendar-component-set><x0:comp name="VEVENT"/><x0:comp name="VTODO"/><x0:comp name="VJOURNAL"/></x0:supported-calendar-component-set>'+
          "    </x1:prop>\n"+
          "  </x1:set>\n"+
          '</x1:mkcol>'
          ,complete: function (r,s){
            $.fn.caldav('spinner',false);
            if (s=='success')
              $(this).caldav('madeCalendar',r);
          }
        }));
      }
      else
      {
        $.mkcalendar ($.extend(true,{},$.fn.caldav.options,params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
          '<x0:mkcalendar xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:" '+ns+'>'+
          '  <x1:set>'+
          '    <x1:prop>'+
            str +
          '      <x0:supported-calendar-component-set><x0:comp name="VEVENT"/><x0:comp name="VTODO"/><x0:comp name="VJOURNAL"/></x0:supported-calendar-component-set>'+
          '    </x1:prop>'+
          '  </x1:set>'+
          '</x0:mkcalendar>'
          ,complete: function (r,s){
            $.fn.caldav('spinner',false);
            if (s=='success')
              $(this).caldav('madeCalendar',r);
          }
        }));
      }
      return this;
    },

    delCalendar : function( cal ) { 
      $.fn.caldav('spinner',true);
      if ( cal.length > 3 )
        url=cal;
      else
        url=$.fn.caldav.calendarData[cal].href;
      var tmpOptions = $.extend(true,{},jQuery.fn.caldav.options);
      tmpOptions.url = url;
      delete tmpOptions.headers;
      $.options ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
        if ( s != "success" && s != "notmodified" ) 
        {
          $.fn.caldav('spinner',false);
          if ( $.fn.caldav.options.deletedCalendar.apply != undefined ) 
            $.fn.caldav.options.deletedCalendar(r,s);
          return ;
        }
        $.del ($.extend(true,tmpOptions,{data:null,headers:{Depth: "infinity"},complete: function (r,s){
          $.fn.caldav('spinner',false);
          if ( $.fn.caldav.options.deletedCalendar != undefined &&$.fn.caldav.options.deletedCalendar.apply != undefined ) 
            $.fn.caldav.options.deletedCalendar(cal,r,s);}
        }))
      }}));
      return this;
    },  
    
    putEvent : function( params , content ) {   
      $.fn.caldav('spinner',true);
      var tmpOptions = $.extend(true,{},jQuery.fn.caldav.options,params);
      if ( $.fn.caldav.locks[params.url] )
      {
        if ( tmpOptions.headers == undefined ) tmpOptions.headers = {};
        tmpOptions.headers['If']= $.fn.caldav.locks[params.url].token;
        if ( tmpOptions['Schedule-Reply'] != undefined ) tmpOptions.headers['Schedule-Reply'] = tmpOptions['Schedule-Reply'] ;
        $.put ($.extend(true,tmpOptions,{contentType:'text/calendar',data:content,complete: function (r,s){
          $.fn.caldav('spinner',false);
          $.fn.caldav('unlock',params.url);
          $.fn.caldav.options.eventPut(r,s);
          }
        }));
      }
      else
      {
        $.head ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
          if ( r.status != 404 )
            tmpOptions.headers['If-Match']=r.getResponseHeader('ETag');
          $.put ($.extend(true,tmpOptions,{contentType:'text/calendar',data:content,complete: function (r,s){
            $.fn.caldav('spinner',false);
            $.fn.caldav.options.eventPut(r,s);}
          }))
        }}));
      }
      return this;
    },  

    putNewEvent : function( params , content ) {    
      $.fn.caldav('spinner',true);
      var tmpOptions = $.extend(true,{url:params.url},jQuery.fn.caldav.options);
      delete tmpOptions.headers;
      tmpOptions.url = params.url;
      $.head ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
        if ( r.status != 404 )
          params.url = params.url.replace(/(\..{1,8})?$/,'-1$1');
        $.put ($.extend(true,{},jQuery.fn.caldav.options,params,{contentType: 'text/calendar',data:content,complete: function (r,s){
          $.fn.caldav('spinner',false);
          $.fn.caldav.options.eventPut(r,s);}
        }));
        return false;
      }}));
      return this;
    },  

    delEvent : function( params ) {   
      $.fn.caldav('spinner',true);
      var tmpOptions = $.extend(true,{},jQuery.fn.caldav.options,params);
      if ( $.fn.caldav.locks[params.url] )
      {
        if ( tmpOptions.headers == undefined ) tmpOptions.headers = {};
        tmpOptions.headers['If']= $.fn.caldav.locks[params.url].token;
        var headers = {};
        if ( tmpOptions['Schedule-Reply'] != undefined ) tmpOptions.headers['Schedule-Reply'] = tmpOptions['Schedule-Reply'] ;
        $.del ($.extend(true,tmpOptions,{data:null,complete: function (r,s){
            $.fn.caldav('spinner',false);
            delete $.fn.caldav.locks[params.url];
            $.fn.caldav.options.eventDel(params.url);}
          }));
      }
      else
      {
        delete tmpOptions.headers;
        $.head ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
          if ( r.status != 200 && r.status != 207 )
          { r.abort(); 
            $.fn.caldav('spinner',false);
            return false; }
          var headers = {};
          if ( tmpOptions['Schedule-Reply'] != undefined ) tmpOptions.headers['Schedule-Reply'] = tmpOptions['Schedule-Reply'] ;
          tmpOptions.headers={'If-Match':r.getResponseHeader('ETag')};
          $.del ($.extend(true,tmpOptions,{data:null,complete: function (r,s){
            $.fn.caldav('spinner',false);
            $.fn.caldav.options.eventDel(params.url);}
          }))
        }}));
      }
      return this;
    },  
    
    moveEvent : function( params ) {    
      $.fn.caldav('spinner',true);
      if ( $.fn.caldav.locks[params.url] )
        params.headers['If']= $.fn.caldav.locks[params.url].token;
      $.move ($.extend(true,{},jQuery.fn.caldav.options,params,{complete: function (r,s){
        $.fn.caldav('spinner',false);
        if ( $.fn.caldav.locks[params.url] )
          delete $.fn.caldav.locks[params.url];
        $.fn.caldav.options.eventPut(r,s);}
      }));
      return this;
    },  

    madeCalendar : function( content ) {    
      console.log ( 'made calendar' + content ); 
      return this;
    },  

    logout : function( ) {    
      $.fn.caldav('spinner',true);
      for ( var i in $.fn.caldav.locks )
        $.fn.caldav('unlock',i);
      $.fn.caldav.options.username = 'logout';
      $.fn.caldav.options.password = 'logout';
      var req = $.options ({url:$.fn.caldav.options.url+'logout',username:$.fn.caldav.options.username,password:$.fn.caldav.options.password,
        complete: function (r,s){
          $.fn.caldav('spinner',false);
          $.fn.caldav.options.url = undefined;
          $.fn.caldav.principals = undefined;
          $.fn.caldav.calendarData = undefined;
          $.fn.caldav.calendarXml = $("response",r.responseXML);
          if ( $.fn.caldav.options.logout != undefined && $.fn.caldav.options.logout.apply != undefined )
            $.fn.caldav.options.logout( r,s );
          return false;
          },
        error: function (r,s){
          $.fn.caldav('spinner',false);
          $.fn.caldav.options.url = undefined;
          $.fn.caldav.principals = undefined;
          $.fn.caldav.calendarData = undefined;
          $.fn.caldav.calendarXml = undefined; 
          if ( $.fn.caldav.options.logout != undefined && $.fn.caldav.options.logout.apply != undefined )
            $.fn.caldav.options.logout( r,s );
          return false;
          },
      });
      req.abort ();
      $.fn.caldav('spinner',false);
      $.fn.caldav.options.url = undefined;
      $.fn.caldav.principals = undefined;
      $.fn.caldav.calendarData = undefined;
      $.fn.caldav.calendarXml = undefined; 
      return this;
    },  

    updated : function( content ) {   
      //console.log ( 'update calendar' + content ); 
      return this;
    },  
   
    spinner: function ( i )
    {
      if ( i ) 
        $($.fn.caldav.options.loading).show().data('loading',($($.fn.caldav.options.loading).data('loading')+1));
      else
      {
        $($.fn.caldav.options.loading).data('loading',($($.fn.caldav.options.loading).data('loading') -1));
        if ( ( $($.fn.caldav.options.loading).data('loading') + 0 )< 1 )
          $($.fn.caldav.options.loading).hide();
      }
    },

    formatDate : function( ds ) {   
   function pad(n){return n<10 ? '0'+n : n}
     var d = new Date(ds);
     return d.getUTCFullYear() + '' 
      + pad(d.getUTCMonth()+1) + '' 
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours()) + ''
      + pad(d.getUTCMinutes()) + ''
      + pad(d.getUTCSeconds())+'Z';
    },  
  };
  
  $.fn.caldav = function( method ) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.caldav' );
    }    
 } 
})( jQuery );


