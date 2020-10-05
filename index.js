const _ = require('lodash');

const isValidTag = (tag) => {
	//Is valid open tag or close Tag
	return (/<[A-Z]>/g).test(tag) || (/<\/[A-Z]>/g).test(tag);
};

const validateTag = (markup) => {
	const stack = [];
	let htmlText = markup.replace(/<[^>]*\/\s?>/g, '');
	htmlText = htmlText.replace(/<[^A-Z\/][a-z\D\d.\s]+?>/g, '');
	
	const allTags = htmlText.match(/<.*?>/g);
	
	let result = null;
	
	for (let i = 0; i < allTags.length; i++) {
		let isValid = isValidTag(allTags[i]);
		if (isValid) {
			let tagKey = allTags[i].match(/[A-Z]/g)[0];
			if (!_.includes(allTags[i], '/')) {
				// Add all open tag to stack
				stack.push(tagKey);
			} else {
				if (stack.length > 0 && stack[stack.length - 1] !== tagKey) {
					// wrong nesting case
					result = {
						success: false,
						expected: `</${stack[stack.length - 1]}>`,
						unexpected: allTags[i],
						message: `Expected </${stack[stack.length - 1]}> found ${allTags[i]}`
					};
					break;
				} else if (!_.includes(stack, tagKey)) {
					//Missing open tag
					result = {
						success: false,
						expected: '#',
						unexpected: allTags[i],
						message: `Expected # found ${allTags[i]}`
					};
					break;
				} else {
					//remove tag from stack if closing tag is found
					_.pullAt(stack, stack.length - 1);
				}
			}
		} else {
			// Tag is invalid system don't know whether it's an open or a close tag
			result = {success: false, message: `Found invalid tag ${allTags[i]}`};
			break;
		}
	}
	
	if (_.isEmpty(stack) && result == null) {
		result = {success: true, message: 'Correctly tagged paragraph'};
	} else if (stack.length > 0 && result == null) {
		// Missing close tag
		result = {
			success: false,
			expected: `</${stack[0]}>`,
			unexpected: '#',
			message: `Expected </${stack[0]}> found #`
		};
	}
	
	return result;
};

exports.handler = async (event, context, callback) => {
	
	if (!event || (event && !event.body)) return callback({message: 'Markup is required'});
	
	let validate = validateTag(event.body);
	if (!validate.success) {
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
			body: JSON.stringify({message: validate.message})
		};
		return callback(null, response);
	}
	
};
