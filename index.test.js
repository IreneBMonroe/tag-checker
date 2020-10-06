const tagChecker = require('./index');
const context = 'context';

test('Expect this test case to pass', async (done) => {
    let event = {
        body: 'The following text<C><B>is centred and in boldface<\/B></C>'
    };
    const callback = (err, response) => {
        if (err) {
            done(err);
        }

        expect(response.statusCode).toEqual(200);
        expect(typeof response.body).toBe("string");
        let body = JSON.parse(response.body);
        expect(body).toEqual({
            message: 'Correctly tagged paragraph'
        });
        done();
    };
    return await tagChecker.handler(event, context, callback);
});

test('Expect this test case to pass', async (done) => {
    let event = {
        body: 'The following text<C><BB>is centred and in boldface</BB></C>'
    };
    const callback = (err, response) => {
        if (err) {
            done(err);
        }

        expect(response.statusCode).toEqual(200);
        expect(typeof response.body).toBe("string");
        let body = JSON.parse(response.body);
        expect(body).toEqual({
            message: 'Correctly tagged paragraph'
        });
        done();
    };
    return await tagChecker.handler(event, context, callback);
});

test('Expect this test case to pass', async (done) => {
    let event = {
        body: '<B>This <\\g>is <B>boldface</B> in <<*> a</B> <\\6> <<d>sentence'
    };

    const callback = (err, response) => {
        if (err) {
            done(err);
        }
        expect(response.statusCode).toEqual(200);
        expect(typeof response.body).toBe("string");
        let body = JSON.parse(response.body);
        expect(body).toEqual({
            message: 'Correctly tagged paragraph'
        });
        done();
    };

    return await tagChecker.handler(event, context, callback);
});

test('Catch error incorrect nested', async (done) => {
    let event = {
        body: '<B><C> This should be centred and in boldface, but the tags are wrongly nested </B></C>'
    };
    const callback = (err, response) => {
        console.log('error', err);
        if (err) {
            expect(err).toEqual({
                message: 'Expected <\/C> found <\/B>'
            });
            done();
        }
    }
    return await tagChecker.handler(event, context, callback);
});

test('Catch error missing open tags or an extra closing tag', async (done) => {
    let html = '<B>This should be in boldface, but there is an extra closing tag</B></C>';

    let event = {
        body: html
    };
    const callback = (err, response) => {
        if (err) {
            expect(err).toEqual({
                message: 'Expected # found <\/C>'
            });
            done();
        }
    };
    return await tagChecker.handler(event, context, callback);
});

test('Catch error missing close tag', async (done) => {
    let event = {
        body: '<B><C>This should be centred and in boldface, but there is a missing closing tag</C>'
    };

    const callback = (err, response) => {
        if (err) {
            expect(err).toEqual({
                message: 'Expected <\/B> found #'
            });
            done();
        }
    };
    return await tagChecker.handler(event, context, callback);
});

test('Catch error invalid tag', async (done) => {
    let event = {
        body: '<B><C>This should be centred and in boldface, <B\/B>but there is a missing closing tag</C></B>'
    };

    const callback = (err, response) => {
        if (err) {
            expect(err).toEqual({
                message: 'Expected # found <B\/B>'
            });
            done();
        }
    };
    return await tagChecker.handler(event, context, callback);
});

test('Catch error missing open tag', async (done) => {
    let event = {
        body: 'This should be centred and in boldface, but there is a missing closing tag</C></B>'
    };

    const callback = (err, response) => {
        if (err) {
            expect(err).toEqual({
                message: 'Expected # found <\/C>'
            });
            done();
        }
    };
    return await tagChecker.handler(event, context, callback);
});
