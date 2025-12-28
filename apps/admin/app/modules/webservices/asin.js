const productUrl = req.query.url;

  if (!productUrl) {
    return res.status(400).send('Product URL is required');
  }

  const asin = extractASINFromUrl(productUrl);  // Extract the ASIN from the URL
  const params = {
    Service: 'AWSECommerceService',
    Operation: 'ItemLookup',
    AWSAccessKeyId: AMAZON_ACCESS_KEY,
    AssociateTag: AMAZON_ASSOCIATE_TAG,
    ItemId: asin,
    ResponseGroup: 'Images,ItemAttributes,Offers,Reviews',
  };

  try {
    const response = await axios.get(AMAZON_API_URL, { params });
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching data from Amazon API');
  }

const extractASINFromUrl = (url) => {
  const match = url.match(/(?:dp|product)\/([A-Z0-9]{10})/);
  return match ? match[1] : null;
};
