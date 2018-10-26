const got = require('got');

jest.setTimeout(10000);

describe('Rest API tests', () => {

  test('Approptiate review', async () => {
    const random = Math.random();
    const data = {
      "name": "Smart Tester",
      "email": "smart@tester.com",
      "productid": "2",
      "rating": 4,
      "review": "Proper review " + random
    }

    const {id, productid} = (await got.post('http://localhost:8080/v1/review', {json:true,body:data})).body;
    expect(id).toEqual(expect.any(String));

    {
      const {status} = (await got.get('http://localhost:8080/v1/review/' + id, {json:true})).body;
      expect(status).toEqual(expect.stringMatching(/^(created|moderated)$/));
    }
    await new Promise((res)=>setTimeout(res, 5000));

    {
      const {status} = (await got.get('http://localhost:8080/v1/review/' + id, {json:true})).body;
      expect(status).toEqual(expect.stringMatching(/^(published)$/));
    }

    {
      const arr = expect.arrayContaining([
        expect.objectContaining({
          review: expect.stringMatching(data.review)
        })
      ]);
      const {reviews} = (await got.get('http://localhost:8080/v1/product/' + productid, {json:true})).body;
      expect(reviews).toEqual(arr);
    }
  });

  test('Inapproptiate review', async () => {
    const random = Math.random();
    const data = {
      "name": "Smart Tester",
      "email": "smart@tester.com",
      "productid": "2",
      "rating": 4,
      "review": "Shit review " + random
    }

    const {id, productid} = (await got.post('http://localhost:8080/v1/review', {json:true,body:data})).body;
    expect(id).toEqual(expect.any(String));

    {
      const {status} = (await got.get('http://localhost:8080/v1/review/' + id, {json:true})).body;
      expect(status).toEqual(expect.stringMatching(/^(created|moderated)$/));
    }
    await new Promise((res)=>setTimeout(res, 5000));

    {
      const {status} = (await got.get('http://localhost:8080/v1/review/' + id, {json:true})).body;
      expect(status).toEqual(expect.stringMatching(/^(archived)$/));
    }

    {
      const arr = expect.arrayContaining([
        expect.objectContaining({
          review: expect.stringMatching(data.review)
        })
      ]);
      const {reviews} = (await got.get('http://localhost:8080/v1/product/' + productid, {json:true})).body;
      expect(reviews).not.toEqual(arr);
    }
  });

});