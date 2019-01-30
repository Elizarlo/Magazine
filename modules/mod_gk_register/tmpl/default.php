<?php

/**
* Layout file
* @package GK Register GK4
* @Copyright (C) 2009-2011 Gavick.com
* @ All rights reserved
* @ Joomla! is Free Software
* @ Released under GNU/GPL License : http://www.gnu.org/copyleft/gpl.html
* @version $Revision: GK4 1.0 $
**/

// no direct access
defined('_JEXEC') or die;
jimport('joomla.application.component.helper');
JHtml::_('behavior.keepalive');
JHtml::_('behavior.tooltip');
JHtml::_('behavior.formvalidation');

// check whether reCaptcha is enabled
if(JPluginHelper::isEnabled('captcha', 'recaptcha')) {
	if (JBrowser::getInstance()->isSSLConnection()) {
        JHtml::_('script', 'https://www.google.com/recaptcha/api/js/recaptcha_ajax.js');
    } else {
        JHtml::_('script', 'http://www.google.com/recaptcha/api/js/recaptcha_ajax.js');
    }
	$plugin = JPluginHelper::getPlugin('captcha', 'recaptcha');
	$tmp = (string)$plugin->params;
	$par = json_decode($tmp);
	
	$code = 'jQuery(document).ready( function(){ 
	jQuery("#submit_1").css(\'display\',\'none\');
	});
	function showGKRecaptcha(element, submitButton, recaptchaButton) {
  	Recaptcha.destroy();
  	Recaptcha.create("'.$par->public_key.'", element, {theme: \''.$par->theme.'\', tabindex: 0, callback: Recaptcha.focus_response_field}); 
 	jQuery(".register_submit").css(\'display\',\'none\');
 	jQuery(".recaptcha_required").css(\'display\',\'block\');
 	jQuery("#recaptcha_required_1").css(\'display\',\'none\');
 	jQuery("#submit_1").css(\'display\',\'block\');
	jQuery("#submit_1").css(\'width\',\'auto\');
	}';
	
} else {
	$code = '
	function showGKRecaptcha(element, submitButton, recaptchaButton) {}';
}
$document = JFactory::getDocument();
$document->addScriptDeclaration($code);

?>

<div class="gkRegistration">
	<form id="member-registration" action="<?php echo JRoute::_('index.php?option=com_users&task=registration.register'); ?>" method="post" class="form-validate">
		
		<?php foreach ($gkform->getFieldsets() as $fieldset): // Iterate through the form fieldsets and display each one.?>
			<?php $fields = $gkform->getFieldset($fieldset->name);?>
			<?php if (count($fields)):?>
				<fieldset>
				<?php if (isset($fieldset->label)):// If the fieldset has a label set, display it as the legend.?>
					<legend><?php echo JText::_($fieldset->label);?></legend>
				<?php endif;?>
					<dl>
				<?php foreach($fields as $field):// Iterate through the fields in the set and display them.?>
					<?php if ($field->hidden):// If the field is hidden, just display the input.?>
						<?php echo $field->input;?>
					<?php else:?>
                    	
						<dt>
						<?php echo $field->label; ?>
						<?php if (!$field->required && (!$field->type == "spacer")): ?>
							<span class="optional"><?php echo JText::_('COM_USERS_OPTIONAL');?></span>
						<?php endif; ?>
						</dt>
                        <?php if($field->type != 'Captcha') : ?>
                         	<dd><?php echo $field->input;?></dd>
                        <?php else: ?>
                        	<dd><div id="gk_recaptcha"></div></dd>
                        <?php endif; ?>
					<?php endif;?>
				<?php endforeach;?>
					</dl>
				</fieldset>
			<?php endif;?>
		<?php endforeach;?>
		
		
		
		<div>
        
			<input type="button" id="recaptcha_required_1" onclick="showGKRecaptcha('gk_recaptcha',  'submit_1', 'recaptcha_required_1');"  value="<?php echo JText::_('JREGISTER');?>"  class="recaptcha_required"/>  
            <input type="submit" id="submit_1" class="register_submit validate" value="<?php echo JText::_('JREGISTER');?>"/>
			<?php echo JText::_('COM_USERS_OR');?>
			<a href="<?php echo JRoute::_('');?>" title="<?php echo JText::_('JCANCEL');?>"><?php echo JText::_('JCANCEL');?></a>
			<input type="hidden" name="option" value="com_users" />
			<input type="hidden" name="task" value="registration.register" />
			<?php echo JHtml::_('form.token');?>
		</div>
	</form>
</div>