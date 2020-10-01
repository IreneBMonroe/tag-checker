const _ = require('lodash');

const validateTag = (markup) =>{
    if (!markup) return;
    const stack = [];

    let htmlText = markup.replace(/<[^>]*\/\s?>/g, '');
    htmlText = htmlText.replace(/<[^A-Z\/][a-z\D\d.\s]+?>/g, '');

    const allTags = htmlText.match(/<.*?>/g);

    let result = null;
    if (allTags){
        _.forEach(allTags, (tag, i) =>{
            let tagKey = tag.match(/[A-Z]/g)[0];
            if (result === null){
                if (!_.includes(tag, '/')){
                    // Add all open tag to stack
                    if(stack.length > 0){
                        let foundTag = _.find(stack, tagKey);
                        if(!foundTag){
                            stack.push(tagKey);
                        }
                    }else{
                        // Update add open tag to stack
                        stack.push(tagKey);
                    }
                }else {
                    if (_.includes(tag, '/')) {

                        // if closing tag expect to see open tag as last index of stack
                        if (!_.isEmpty(stack) || stack.length > 0) {

                            if (_.includes(stack, tagKey) && stack[stack.length-1] !== tagKey) {
                                // wrong nesting case
                                result = {
                                    success: false,
                                    expected: `</${stack[stack.length-1]}>`,
                                    unexpected: tag,
                                    message: `Expected </${stack[stack.length-1]}> found ${tag}`
                                };

                            } else if(!_.includes(stack, tagKey)){
                                //Missing open tag
                                let foundMatch = _.find(stack, tagKey);
                                if (!foundMatch){
                                    result = {
                                        success: false,
                                        expected: '#',
                                        unexpected: tag,
                                        message: `Expected # found ${tag}`
                                    };
                                }

                            } else {
                                //remove tag from stack if closing tag is found
                                _.pullAt(stack, stack.length-1);
                            }
                        }
                    }
                }
            }
        });
    }

    if (_.isEmpty(stack) && result == null){
        result = { success: true, message: 'Correctly tagged paragraph'} ;
    } else if (stack.length > 0 && result == null){
        // Missing close tag
        result = {success: false, expected: `</${stack[0]}>`, unexpected: '#', message: `Expected </${stack[0]}> found #`};
    }

    return result;
};

exports.handler = async (event, context, callback) => {

    if(!event) return callback({message: 'Markup is required'});
    if(event && !event.body) return callback({message: 'Markup is required'});
    let validate = validateTag(event.body);
    if (!validate.success){
        // return error response
        return callback({message: validate.message});
    } else {
        // return success response
        let response = {
            isBase64Encoded: false,
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({message : validate.message})
        };
        return callback(null, response);
    }

};
