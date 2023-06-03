

const assertInclude = (source,target) =>{
    if (!target) {
        return false
    }
    return target.includes(source)
}


const assertEqual = (source,target) => {
    if (!target) {
        return false
    }
    return target == source
}

const assertGt = (source, target) => {
    if (!target) {
        return false
    }
    return target > source
}

const assertLt = (source, target) => {
    if (!target) {
        return false
    }
    return target < source
}

const assertStatusCode = (actualValue, desireValue) => {
    // 响应码不是数字，均返回false
    try {
        const actualCode = parseInt(actualValue)
        const desire = parseInt(desireValue)
        return actualCode == desire
    } catch(err) {
        
        return false
    }
}


const assertDuration = (actualValue, desireDur, operation="lte") => {
    try {
        const aDur = parseInt(actualValue)
        const dDur = parseInt(desireDur)
        switch(operation) {
            case "lte": {
                return aDur <= dDur
            }
            case "gte": {
                return aDur >= dDur
            }
            default: {
                return aDur < dDur
            }
        }
    } catch (err) {
        return false
    }
}

module.exports = {
    assertEqual,
    assertInclude,
    assertGt,
    assertLt,
    assertStatusCode,
    assertDuration
}