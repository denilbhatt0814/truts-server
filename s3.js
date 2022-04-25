const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ID
const secretAccessKey = process.env.AWS_SECRET

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

// uploads a file to s3
async function uploadFile(imageBinary, name) {
    const type = imageBinary.split(';')[0].split('/')[1];
    var buf = Buffer.from(imageBinary.replace(/^data:image\/\w+;base64,/, ""), 'base64')
    var data = {
        Key: name,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: `image/${type}`,
        Bucket: bucketName
    };
    let res;
    s3.putObject(data, function (err, data) {
        if (err) {
            console.log(err);
            console.log('Error uploading data: ', data);
            res = false;
        } else {
            //console.log('successfully uploaded the image!');
            res = true;
        }
    });
    return res;
}


module.exports = uploadFile;