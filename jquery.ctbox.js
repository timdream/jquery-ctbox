/*!
*   jQuery CT-BOX plug-in
*
*   將所選的元素內的文字使用 CT-BOX 的網路字型呈現。
*
*   Author: timdream <timdream@gmail.com>, http://timc.idv.tw/
*   License: MIT-LICENSE
*
*   使用方法：
*   $(el).ctbox(settings);
*
*   el: 所有的需要使用某「魔力空間」的元素。最好一次選到以免重複下載字型/字型名稱衝突。
*   settings: 設定物件，可用設定：
*   * key: CT-BOX API Key。
*   * tag: 魔力空間 tag（例如「ct1」），預設「ct1」。
*   * str: 手動輸入需要的字元字串。
*   * text: 同上。
*   * success、complete、error: 取得字型時的 JSON-P 呼叫 callback。
*   * detectText: 自動包含 el 元素內的文字，關閉則需使用 text/str 輸入文字
*   * addFontFaceStyle: 在頁面插入指定網路字型用的 <style>。若關閉則需自行從 success callback 自行插入。
*   * fontFaceName: 前項開啟時，網路字型插入時使用的字型名稱。預設為魔力空間 tag。
*   * addFontFamily: 對 el 元素加上設定字型的 CSS。
* 
*   全域設定：
*   * $.ctBoxKey: CT-BOX API Key，在此指定或是用 settings 的 key。
*
*/

"use stricts";

(function ($) {

// Substitute console.log with a local $.noop function if there isn't one.
if (!window.console || !window.console.log) {
	var console = console || {};
	console.log = $.noop;
}

$.ctBoxKey = '';
$.fn.ctbox = function (settings) {

	if (window.location.protocol.substr(0,4) !== 'http') {
		console.log('[jquery.ctbox] CT-BOX 無法在本機端運作。');
		return this;
	}

	var options = {
		key: $.ctBoxKey || '',
		tag: 'ct1',
		str: '',
		text: '',
		success: $.noop,
		error: $.noop,
		complete: $.noop,
		detectText: true,
		addFontFaceStyle: true,
		fontFaceName: '',
		addFontFamily: true
	},
	$els = this;

	$.extend(settings, options);

	var text = settings.str + settings.text;
	if (settings.detectText) text += $els.text();

	// TBD: remove duplicate characters

	if (!settings.key) {
		console.log('[jquery.ctbox] 沒有輸入 API Key。');
		return this;
	}

	if (text > 1000) {
		console.log('[jquery.ctbox] 文字太多。');
		return this;
	}

	$.ajax(
		{
			url: 'http://dhs.ct-box.net/api/font?callback=?',
			type: 'get',
			dataType: 'jsonp',
			data: {
				key: settings.key,
				str: $els.text(),
				tag: settings.tag
			},
			success: function (data) {
				if (!data || data.message !== 1102) {
					console.log(
						'[jquery.ctbox] 發生錯誤，'
						+ ((data && data.message)?'伺服器傳回 Code ' + data.message:'，伺服器回應有誤。')
						+ '請參考 http://www.ct-box.net/api/ 之說明。'
					);
				}
				if (settings.addFontFaceStyle) {
					$('#jquery-ctbox-' + (settings.fontFaceName || settings.tag)).remove();
					($('head').length?$('head'):$('html')).append(
						'<style class="jquery-ctbox-' + (settings.fontFaceName || settings.tag) + '" type="text/css">'
						+ '@font-face {'
						+ 'font-family: ' + (settings.fontFaceName || settings.tag) + ';'
						+ 'src: url('+ data.fontpath + '?type=eot);'
						+ 'src: local(" "), url('+ data.fontpath + '?type=ttf) format("truetype"), url('+ data.fontpath + '?type=woff) format("woff");'
						+ '}'
						+ '<style>'
					);
				}
				if (settings.addFontFamily) {
					$els.css(
						'font-family',
						(settings.fontFaceName || settings.tag)
					);
				}
				settings.success.apply(this, arguments);
			},
			complete: settings.complete,
			error: function (xhr, status, errorThrown) {
				console.log(
					'[jquery.ctbox] 發生錯誤，jQuery 傳回 ' + status + '。'
				);
				settings.error.apply(this, arguments);
			}
		}
	);
	return this;
}
	
})(jQuery);