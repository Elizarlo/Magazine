/*
 *
 * Main Tabs GK5 back-end script
 *
 */
var JA_options = {
	tabs: null, // tabs data in JSON format
	translations: null, // array for translations
	isDragged: false, // flag for dragging
	sortables: null // Sortables object for tabs
};
// DOMContentLoaded event
jQuery(document).ready(function(){
	// initialize the configuration manager
	TabsGK5ConfigManager();
	// initialize the main class
	TabsGK5Settings();
	// check Joomla! version and add suffix
	if(parseFloat((jQuery('#gk_about_us').data('jversion')).substr(0,3)) >= '3.2') {
		jQuery('#module-form').addClass('j32');
	}
	jQuery( "#tabs_list" ).sortable({
		update: function( event, ui ) {
			JA_options.tabs=[];
			let items = jQuery('#tabs_list .gk_tab_item');
			for (let i=0;i<items.length;i++) {
				let el = jQuery(items[i]);
				let name = el.find('.gk_tab_edit_name').val();
				let type = el.find('.gk_tab_edit_type').val();
				let access = el.find('.gk_tab_edit_content_access').val();
				let published = el.find('.gk_tab_edit_published').val();
				let xhtml = el.find('.gk_tab_edit_content_xhtml').val();
				let module = el.find('.gk_tab_edit_content_module').val();
				let id = el.find('.gk_tab_edit_id').val();
				let animation = el.find('.gk_tab_edit_animation').val();
				JA_options.tabs[i] = {
					"name" : name,
					"type" : type,
					"content" : (type == 'module') ? module : htmlspecialchars(xhtml),
					"published" : published,
					"access" : access,
					"id": id,
					"animation": animation
				};
			}
			jQuery('#jform_params_tabs_data').html(JSON.stringify(JA_options.tabs));
		}
	});
    jQuery( "#tabs_list" ).disableSelection();
});

/*
 *
 * Main class
 *
 */

function TabsGK5Settings(){
	// constructor
	this.initialize = function() {
	
		// fix accordian names
		jQuery('#moduleOptions a[href^="#collapse"]').each(function() {
			jQuery(this).attr('id', jQuery(this).html().replace(/ /g,'_').replace('!', ''));
		});
		jQuery('#gk_about_us').parent().css('margin-left', '15px');
		// helper handler
		$this = this;
		// handlers used in the code
		var add_form = jQuery('#gk_tab_add_form');
		var add_form_btns = add_form.find('.gk_tab_add_submit a');
		var add_form_scroll_wrap = add_form.find('.height_scroll');
		// decode the data
		if (jQuery('#jform_params_tabs_data').html() != '')
			JA_options.tabs = JSON.parse(jQuery('#jform_params_tabs_data').html());
		// check if the tabs object is null - if yes - fill it with an empty array
		if(JA_options.tabs == null || JA_options.tabs == '') JA_options.tabs = [];
		// put empty array for the translations
		JA_options.translations = [];
		// initialize the forms
		this.formInit();
		// current mode
		var sourceMode = jQuery('#jform_params_module_data_source').val();
		// add unvisible class
		if(sourceMode == 'external') {
			if(jQuery('#Tabs')) { jQuery('#Tabs').parent('.accordion-group').addClass('gkUnvisible'); }
		} else {
			if(jQuery('#External_sources')) { jQuery('#External_sources').parent('.accordion-group').addClass('gkUnvisible'); }
		} 

		// hide one of unnecessary tabs
		jQuery('#jform_params_tabs_data-lbl').parent().css('display', 'none');
		jQuery('#jform_params_tabs_data-lbl').parent().parent().find('.controls').css('margin-left', 0);
		jQuery('#jform_params_module_data_source').on('change', function() {
			if(sourceMode != jQuery('#jform_params_module_data_source').val()) {
				sourceMode = jQuery('#jform_params_module_data_source').val();
				if(sourceMode == 'external') {
					jQuery('#Tabs').parent('.accordion-group').addClass('gkUnvisible');
					jQuery('#External_sources').parent('.accordion-group').removeClass('gkUnvisible');
				} else {
					jQuery('#Tabs').parent('.accordion-group').removeClass('gkUnvisible');
					jQuery('#External_sources').parent('.accordion-group').addClass('gkUnvisible');
				} 
			}
		});
		// function used for changing data source to help if the onChange event doesn't fire
		jQuery('#jform_params_module_data_source').on('blur', function() {
			jQuery('#jform_params_module_data_source').trigger('change');	
		});
		// get translations texts
		JA_options.translations['module_text'] = add_form.find('.gk_tab_add_type option').eq(0).html();
		JA_options.translations['xhtml_text'] = add_form.find('.gk_tab_add_type option').eq(1).html();
		JA_options.translations['published_text'] = jQuery('#invisible').find('.gk_tab_item_state span').eq(0).html();
		JA_options.translations['unpublished_text'] = jQuery('#invisible').find('.gk_tab_item_state span').eq(1).html();
		// hide unnecessary elements
		jQuery('#invisible').find('.gk_tab_item_state span').remove();
		// set the add form
		if(add_form.find('.gk_tab_add_type').val() == 'module') {
			add_form.find('.gk_tab_add_content_xhtml').css('display', 'none');
			add_form.find('.gk_tab_add_content_module').css('display', 'inline-block');
		} else {
			add_form.find('.gk_tab_add_content_xhtml').css('display', 'inline-block');
			add_form.find('.gk_tab_add_content_module').css('display', 'none');
		}
		// add tab form events
		add_form.find('.gk_tab_add_type').on('change', function(){
			if(add_form.find('.gk_tab_add_type').value == 'module') {
				add_form.find('.gk_tab_add_content_xhtml').css('display', 'none');
				add_form.find('.gk_tab_add_content_module').css('display', 'inline-block');
			} else {
				add_form.find('.gk_tab_add_content_xhtml').css('display', 'inline-block');
				add_form.find('.gk_tab_add_content_module').css('display', 'none');
			}
		});

		// onClick event for the header in the tabs manager
		jQuery('#gk_tab_add_header').find('a').on('click', function() {
			if(!jQuery(this).hasClass('opened')) {
				jQuery(this).addClass('opened');
				add_form_scroll_wrap.css('height', 'auto');
			} else {
				jQuery(this).removeClass('opened');
				add_form_btns.eq(1).trigger('click');
			}
		});
		// cancel button
		add_form_btns.eq(1).on('click', function() {
			// clear the form
			add_form.find('.gk_tab_add_name').val('');
			add_form.find('.gk_tab_add_type').val('xhtml');
			add_form.find('.gk_tab_add_content_xhtml').css('display', 'block');
			add_form.find('.gk_tab_add_content_module').css('display', 'none');
			add_form.find('.gk_tab_add_content_module').val('tab1');
			add_form.find('.gk_tab_add_content_xhtml').val('');
			add_form.find('.gk_tab_add_published').val('1');
			add_form.find('.gk_tab_add_id').val('');
			add_form.find('.gk_tab_add_animation').val('default');
			add_form.find('.gk_tab_add_content_access').val('1');
			// hide the form
			add_form_scroll_wrap.css('height', '0px');
			jQuery('#gk_tab_add_header').find('a').removeClass('opened');
		});
		// save button
		add_form_btns.eq(0).on('click', function(e) {
			$this.create_item('new', false);
		});
		// generate the list
		for (let x in JA_options.tabs) {
			let tab = JA_options.tabs[x];
			$this.create_item(tab, true);
		}
// 		JA_options.tabs.each(function(tab) {
// 			$this.create_item(tab, true);
// 		});
		// enable drag'n'drop
		/*JA_options.sortables = new GKSortables(jQuery('#tabs_list'), {
			clone: true, 
			opacity: 0.5, 
			onStart: function(element, clone) {
				clone.addClass('gk_tab_item_clone');
				var iter = 0;
				jQuery('#tabs_list').find('.gk_tab_item').each(function(el) {
					if(!el.hasClass('gk_tab_item_clone')) {
						el.attr('data-order', iter);
						iter++;
					}
				});
				
				jQuery('#tabs_list').addClass('dragging');
				JA_options.isDragged = true;
			},
			onComplete: function(element) {
				if(JA_options.isDragged){
					if(jQuery('#tabs_list').hasClass('dragging')) {
						jQuery('#tabs_list').removeClass('dragging');
					}
					// getting new order
					var newOrder = [];
					jQuery('#tabs_list').find('.gk_tab_item').each(function(el, i) {
						if(!el.hasClass('gk_tab_item_clone') && el.getProperty('data-order') != null) {
							newOrder.push(el.getProperty('data-order').toInt());
						}
						el.removeProperty('data-order');
					});
					// make a new order
					var tempTabs = [];
					newOrder.each(function(item,i) {
						tempTabs[i] = JA_options.tabs[item];
					});
					// save new tabs order
					JA_options.tabs = tempTabs;
					// put the data to textarea field
					jQuery('#jform_params_tabs_data').innerHTML = JSON.stringify(JA_options.tabs);
					// to avoid problems with opening tab editor
					(function() {
						JA_options.isDragged = false;
					}).delay(100);
				}
			}
		});*/
	};
	// function to create a new tab item
	this.create_item = function(source, init) {
		$this = this;
		var add_form = jQuery('#gk_tab_add_form');
		var add_form_btns = add_form.find('.gk_tab_add_submit a');
		// duplicate item structure
		var item = jQuery('#invisible').find('.gk_tab_item').clone();
		// get the values from the form
		var name = (source == 'new') ? add_form.find('.gk_tab_add_name').val() : source.name;
		var type = (source == 'new') ? add_form.find('.gk_tab_add_type').val() : source.type;
		var module = (source == 'new') ? add_form.find('.gk_tab_add_content_module').val() : (source.type == 'module') ? source.content : 'tab1';
		var xhtml = (source == 'new') ? add_form.find('.gk_tab_add_content_xhtml').val() : source.content;
		var published = (source == 'new') ? add_form.find('.gk_tab_add_published').val() : source.published;
		var access = (source == 'new') ? add_form.find('.gk_tab_add_content_access').val() : source.access;
		var id = (source == 'new') ? add_form.find('.gk_tab_add_id').val() : source.id;
		var animation = (source == 'new') ? add_form.find('.gk_tab_add_animation').val() : source.animation;
		// put the values to the item
		item.find('.gk_tab_item_name').html(name);
		item.find('.gk_tab_item_type').html((type == 'module') ? JA_options.translations['module_text'] : JA_options.translations['xhtml_text']);
		item.find('.gk_tab_item_state').attr('class', (published == 1) ? 'gk_tab_item_state published' : 'gk_tab_item_state unpublished');
		item.find('.gk_tab_item_state').attr('title', (published == 1) ? JA_options.translations['published_text'] : JA_options.translations['unpublished_text']);
		item.find('.gk_tab_item_access').html(add_form.find('.gk_tab_add_content_access option[value="'+access+'"]').html());
		item.find('.gk_tab_item_access').attr("title", add_form.find('.gk_tab_add_content_access option[value="'+access+'"]').html());
		//
		// add the events to the item buttons
		//
		// fill the edit form
		item.find('.gk_tab_edit_name').val(name);
		item.find('.gk_tab_edit_type').val(type);
		item.find('.gk_tab_edit_content_access').val(access);
		item.find('.gk_tab_edit_published').val(published);
		item.find('.gk_tab_edit_content_xhtml').val(htmlspecialchars_decode(xhtml));
		item.find('.gk_tab_edit_content_module').val(module);
		item.find('.gk_tab_edit_id').val(id);
		item.find('.gk_tab_edit_animation').val(animation);
		// edit
		item.find('.gk_tab_item_desc').on('click', function(e){
			if(e) e.preventDefault();
			
			if(!JA_options.isDragged) {
				var scroller = item.find('.gk_tab_editor_scroll');

				if(scroller.height() > 0) {
					scroller.css('height', "0px");
					item.removeClass('isOpened');
				} else {
					item.parent().find('.gk_tab_item').each(function() {
						if(jQuery(this) != item)
							jQuery(this).find('.gk_tab_edit_submit a').eq(1).trigger('click');
					});

					scroller.css('height', "auto");
					item.addClass('isOpened');
				}
			}
		});
		// publish / unpublish
		item.find('.gk_tab_item_state').on('click', function() {
// 			if(e) e.preventDefault();
			var btn = jQuery(this);//.item.find('.gk_tab_item_state');
			item.find('.gk_tab_edit_published').val(btn.hasClass('published') ? 0 : 1);
			btn.attr('class', btn.hasClass('published') ? 'gk_tab_item_state unpublished' : 'gk_tab_item_state published');
			btn.attr('title', JA_options.translations[btn.hasClass('published') ? 'unpublished_text' : 'published_text']);
			item.find('.gk_tab_edit_submit a').eq(0).trigger('click');
		});
		// set the content of the form
		var itemMode = item.find('.gk_tab_edit_type').val();
		item.find('.gk_tab_edit_content_xhtml').css('display', itemMode == 'module' ? 'none' : 'inline-block');
		item.find('.gk_tab_edit_content_module').css('display', itemMode == 'module' ? 'inline-block' : 'none');
		// change event
		item.find('.gk_tab_edit_type').off().on('change', function(){
			var itemMode = jQuery(this).val();
			item.find('.gk_tab_edit_content_xhtml').css('display', itemMode == 'module' ? 'none' : 'inline-block');
			item.find('.gk_tab_edit_content_module').css('display', itemMode == 'module' ? 'inline-block' : 'none');
		});
		// remove
		item.find('.gk_tab_item_remove').on('click', function(e){
			if(e) e.preventDefault();
			// get the item ID on list
			var item_id = item.parent().find('.gk_tab_item').index(item);
			// remove the object from the JSON array
			JA_options.tabs.splice(item_id, 1);
			// remove the item from list
			item.remove();
			// put the data to textarea field
			jQuery('#jform_params_tabs_data').html(JSON.stringify(JA_options.tabs));
		});
		// cancel edit
		item.find('.gk_tab_edit_submit a').eq(1).on('click', function() {
			// hide the form
			var scroller = item.find('.gk_tab_editor_scroll');
			scroller.css('height', "0px");
			item.removeClass('isOpened');
		});
		// save edit
		item.find('.gk_tab_edit_submit a').eq(0).on('click', function() {
			// get the data from editor
			var name = item.find('.gk_tab_edit_name').val();
			var type = item.find('.gk_tab_edit_type').val();
			var access = item.find('.gk_tab_edit_content_access').val();
			var published = item.find('.gk_tab_edit_published').val();
			var xhtml = item.find('.gk_tab_edit_content_xhtml').val();
			var module = item.find('.gk_tab_edit_content_module').val();
			var id = item.find('.gk_tab_edit_id').val();
			var animation = item.find('.gk_tab_edit_animation').val();
			// set the data in the JSON object
			var items = item.parent().find('.gk_tab_item');
			var item_id = items.index(item);
			JA_options.tabs[item_id] = {
				"name" : name,
				"type" : type,
				"content" : (type == 'module') ? module : htmlspecialchars(xhtml),
				"published" : published,
				"access" : access,
				"id": id,
				"animation": animation
			};
			// update the item content
			item.find('.gk_tab_item_name').html(name);
			item.find('.gk_tab_item_type').html((type == 'module') ? JA_options.translations['module_text'] : JA_options.translations['xhtml_text']);
			item.find('.gk_tab_item_state').attr('class', (published == 1) ? 'gk_tab_item_state published' : 'gk_tab_item_state unpublished');
			item.find('.gk_tab_item_state').attr('title', (published == 1) ? JA_options.translations['published_text'] : JA_options.translations['unpublished_text']);
			item.find('.gk_tab_item_access').html(add_form.find('.gk_tab_add_content_access option[value="'+access+'"]').html());
			item.find('.gk_tab_item_access').attr("title", add_form.find('.gk_tab_add_content_access option[value="'+access+'"]').html());
			// hide the form
			item.find('.gk_tab_edit_submit a').eq(1).trigger('click');
			// put the data to textarea field
			jQuery('#jform_params_tabs_data').html(JSON.stringify(JA_options.tabs));
		});
		// put the data to object
		if(source == 'new') { // only new objects
			JA_options.tabs.push({
				"name" : name,
				"type" : type,
				"content" : (type == 'module') ? module : htmlspecialchars(xhtml),
				"published" : published,
				"access" : access,
				"id": id,
				"animation": animation
			});
			// clear and hide the form
			add_form_btns.eq(1).trigger('click');
			// put the data to textarea field
			jQuery('#jform_params_tabs_data').html(JSON.stringify(JA_options.tabs));
		}
		// put the item to the list
		jQuery('#tabs_list').append(item);
		// add the new element to the sortables list
		if(!init && jQuery('#tabs_list').find('.gk_tab_item')) {
// 			JA_options.sortables.addItems(jQuery('#tabs_list').getLast('.gk_tab_item'));
		}
	};
	// function used to make other adjustments in the form
	this.formInit = function() {
		jQuery('#config_manager_form').parent().css('margin', '0');
		// adjust the inputs
		jQuery('.input-pixels').each(function(el){jQuery(this).parent().html("<div class=\"input-prepend\">" + jQuery(this).parent().html() + "<span class=\"add-on\">px</span></div>")});
		jQuery('.input-ms').each(function(el){jQuery(this).parent().html("<div class=\"input-prepend\">" + jQuery(this).parent().html() + "<span class=\"add-on\">ms</span></div>")});
		jQuery('.input-percents').each(function(el){jQuery(this).parent().html("<div class=\"input-prepend\">" + jQuery(this).parent().html() + "<span class=\"add-on\">%</span></div>")});
		jQuery('.input-minutes').each(function(el){jQuery(this).parent().html("<div class=\"input-prepend\">" + jQuery(this).parent().html() + "<span class=\"add-on\">minutes</span></div>")});
			
	};
	this.initialize();
};

// function to encode chars
function htmlspecialchars(string) {
	if (string == undefined) return '';
	string = string.toString();
	string = string.replace(/&/g, '[ampersand]').replace(/</g, '[leftbracket]').replace(/>/g, '[rightbracket]');
	return string;
};
// function to decode chars
function htmlspecialchars_decode(string) {
	if (string == undefined) return '';
	string = string.toString();
	string = string.replace(/\[ampersand\]/g, '&').replace(/\[leftbracket\]/g, '<').replace(/\[rightbracket\]/g, '>');
	return string;
};
	
/*
 *
 * Configuration manager class
 *
 */
function TabsGK5ConfigManager() {
	// constructor
	function initialize() {
		// button load
		jQuery('#config_manager_load').on('click', function(e) {
			e.preventDefault();
		    operation('load');
		});
		// button save
		jQuery('#config_manager_save').on('click', function(e) {
			e.preventDefault();
		   	operation('save');
		});
		// button delete
		jQuery('#config_manager_delete').on('click', function(e) {
			e.preventDefault();
		   	operation('delete');
		});
	};
	// operation made by the class
	function operation(type) {
		// current url 
		var current_url = window.location;
		// check if the current url has no hashes
		if((current_url + '').indexOf('#', 0) === -1) {
			// if no - put the variables
		    current_url = current_url + '&gk_module_task='+type+'&gk_module_file=' + jQuery('#config_manager_'+type+'_filename').val();    
		} else {
			// if the url has hashes - remove the hash 
		    current_url = current_url.substr(0, (current_url + '').indexOf('#', 0) - 1);
		    // and put the variables
		    current_url = current_url + '&gk_module_task='+type+'&gk_module_file=' + jQuery('#config_manager_'+type+'_filename').val();
		}
		// redirect to the url with variables
		window.location = current_url;
	};
};