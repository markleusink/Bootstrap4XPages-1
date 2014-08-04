package org.openntf.xsp.bootstrap.renderkit.html_extended.extlib.picker;

/*
 * @author Mark Leusink
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 * 
 * http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
 * implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 *
 */

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import javax.faces.component.UIComponent;
import javax.faces.component.UIInput;
import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;

import org.openntf.xsp.bootstrap.component.UISelect2PickerCombo;
import org.openntf.xsp.bootstrap.resources.BootstrapResources;

import com.ibm.commons.util.StringUtil;
import com.ibm.commons.util.io.json.JsonException;
import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.xsp.component.UIViewRootEx;
import com.ibm.xsp.extlib.renderkit.html_extended.FacesRendererEx;
import com.ibm.xsp.extlib.resources.ExtLibResources;
import com.ibm.xsp.util.FacesUtil;

public class Select2PickerRendererCombo extends FacesRendererEx {
	
	@Override
	public void encodeBegin(FacesContext context, UIComponent component)
			throws IOException {

		ResponseWriter writer = context.getResponseWriter();

		UISelect2PickerCombo picker = (UISelect2PickerCombo) component;

		UIInput _for = (UIInput) getFor(context, picker);

		boolean readOnly = _for != null ? FacesUtil.isComponentReadOnly(
				context, _for) : false;

		// load select2 library and stylesheet
    	UIViewRootEx rootEx = (UIViewRootEx) context.getViewRoot();

    	ExtLibResources.addEncodeResource(rootEx, BootstrapResources.bootstrapPickerSelect2);

		if (!readOnly) {

			String id = picker.getId();

			newLine(writer);
			
			writer.startElement("script", component); // $NON-NLS-1$

			// create the parameters to initialize a new select2 object
			HashMap<String, Object> params = new HashMap<String, Object>();

			params.put("thisId",  id);		//if we name this paramater 'id', Dojo will use it to register the widget
			params.put("control", _for.getClientId(context));
			params.put("isNativeSelect", true);
			params.put("useRemoteData", false);
			params.put("placeHolder", picker.getPlaceHolder());
			params.put("allowClearing", picker.isAllowClearing());
			params.put("formatSelection", picker.getFormatSelection());
			params.put("formatResult", picker.getFormatResult());

			String lw = picker.getListWidth();
			if (StringUtil.isNotEmpty(lw)) {
				params.put("listWidth", lw); // $NON-NLS-1$
			}
			
			try {
				writer.writeText(
						"new extlib.dijit.BootstrapPickerSelect2("
								+ JsonGenerator.toJson(
										JsonJavaFactory.instanceEx, params)
								+ ");", null);
			} catch (JsonException e) {
			}

			writer.endElement("script");
			newLine(writer);

		}

	}

	public static String join(List<?> in, String sep_in) {
		StringBuilder sb = new StringBuilder();
		String sep = "";
		for (Object i : in) {
			sb.append(sep).append(i.toString());
			sep = sep_in;
		}
		return sb.toString();
	}

	@Override
	public void encodeEnd(FacesContext context, UIComponent component)
			throws IOException {

	}

	protected UIComponent getFor(FacesContext context,
			UISelect2PickerCombo picker) {
		// Associated control
		String control = picker.getFor();
		if (StringUtil.isNotEmpty(control)) {
			UIComponent c = FacesUtil.getComponentFor(picker, control);
			return c;
		}
		return null;
	}

}
