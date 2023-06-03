


export const checkStepDto = (stepDto) => {
    if (typeof(stepDto.extract_spec) != "object") {
        return new Error(`extract_spec type invalid for ${typeof(stepDto.extract_spec)}`)
    }

    if (typeof(stepDto.api_headers) != "object") {
        return new Error(`api_headers type invalid for ${typeof(stepDto.api_headers)}`)
    }

    if (typeof(stepDto.api_data) != "object") {
        return new Error(`api_data type invalid for ${typeof(stepDto.api_data)}`)
    }

    if (typeof(stepDto.api_config) != "object") {
        return new Error(`api_config type invalid for ${typeof(stepDto.api_config)}`)
    }

    if (typeof(stepDto.api_param) != "object") {
        return new Error(`api_param type invalid for ${typeof(stepDto.api_param)}`)
    }

    if (!stepDto.case_name) {
        return new Error(`case_name got ${stepDto.case_name} expecet string && not empty`)
    }

    if (!stepDto.case_id) {
        return new Error(`case_id got ${stepDto.case_id} expecet string && not empty`)
    }

    if (stepDto.skipped == undefined || typeof(stepDto.skipped) == "string") {
        return new Error(`skipped got ${stepDto.skipped} expecet boolean && not null`)
    }

    if (!stepDto.belong_module_name) {
        return new Error(`belong_module_name got ${stepDto.belong_module_name} expecet string && not empty`)
    }

    if (stepDto.pre_fn == undefined) {
        return new Error(`pre_fn got ${stepDto.pre_fn} expecet string && not null`)
    }

    if (stepDto.after_fn == undefined) {
        return new Error(`after_fn got ${stepDto.after_fn} expecet string && not null`)
    }

    if (!stepDto.api_url || !stepDto.api_method || !stepDto.api_headers) {
        return new Error(`url or method or headers got ${stepDto.url,stepDto.method, stepDto.api_headers} expecet url->String, method->String, headers->Object`)
    }

    
    if (stepDto.extract_spec && (stepDto.extract_spec.fieldExpect == undefined || stepDto.extract_spec.apiExpect == undefined)) {
        return new Error(`extract_spec parse failed . structure expecet field like fieldExpect or apiExpect`)
    }
    
    if (!stepDto.create_time && !stepDto.update_time) {
        return new Error(`extract_spec parse failed . structure expecet field like fieldExpect or apiExpect`)
    }
    
    try {
        new Date(stepDto.create_time)
        new Date(stepDto.update_time)
    } catch(err) {
        return err.message
    }

    if (!stepDto.create_person && !stepDto.update_person) {
        return new Error(`create perorn or update peroson not specified`)
    }

    return null
}