import {
  S3Client,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

const bucketsToDelete = [
  'goldstack-tfstate-69fe6e313b321c81982b0d1e11ebb8fd679b7dad',
  'goldstack-tfstate-17ed1c8667b59cd518fe5dcb471412dfa6f7e936',
  'goldstack-tfstate-463f5c12a0f7a55c0202d91eba4c6af5c1e1ad05',
  'goldstack-tfstate-37b2f48680eed92c497a81c306d2a2ac06ec29a8',
  'goldstack-tfstate-b98479a8b8da48312dd637e81d5a73e5f22d10fc',
  'goldstack-tfstate-247bd688e66674a31d1b82dcdbf782b3a942fafc',
  'goldstack-tfstate-c5bfd5e0ecd39927d439f1b19dfac4e0e1113d1e',
  'goldstack-tfstate-6dd66549389bf4c244ed7e720d783fa876145216',
  'goldstack-tfstate-8defbde3bdaf8a4a6c7ea912def76c76257b8b2c',
  'goldstack-tfstate-0e650305bc1234177c46508b1e72421db16374d1',
  'goldstack-tfstate-e251eb6fe338ebcc3cfa26b5c0f57ef197f6350b',
  'goldstack-tfstate-afe0ffc9043f78893675a9ae7846203154246370',
  'goldstack-tfstate-bca33eda0082bea909450d2671131080b6507300',
  'goldstack-tfstate-be757785ed3198ecd3b29ea2e07abed90f52442d',
  'goldstack-tfstate-7a97590736751c134d1e780ebaf91d1a005a433a',
  'goldstack-tfstate-f4e54957cf9b42e6b6dacdfff7329619a71df7c6',
  'goldstack-tfstate-233a2dba39ed59ba84911dfcc285d7159bf8c244',
  'goldstack-tfstate-c2c4ac44aa967527548bc9a12f5aa00a0d278dfa',
  'goldstack-tfstate-c1bb92a718cf5987213cacd1f68e294128cdf1ce',
  'goldstack-tfstate-a71273a3f19d25cdc7dbff5c34e5955a0f5d884e',
  'goldstack-tfstate-6795e5ef03a3d134651a53d66fbb6993909952df',
  'goldstack-tfstate-f1cdc4ab53d03fca51750a0aed31ca236711f33b',
  'goldstack-tfstate-55bbfe032f88feacfab6f8ebb777323bd4b877b1',
  'goldstack-tfstate-0e3fcb1e45460cc992d97d72b8cdcdf1a2d9c5ab',
  'goldstack-tfstate-7a4e4b60e867a57b094356cf51b084ae67b0d774',
  'goldstack-tfstate-786ef51399c059e5e47c5726def32a180a844bae',
  'goldstack-tfstate-e54a6f59e3f9b9d4d4bb91b67bde05589f5a5c0d',
  'goldstack-tfstate-191822717e29ecffc2e9dbe0fbea15a1178d5963',
  'goldstack-tfstate-503f517d3835d8269a663d689403ee4404bf3d4a',
  'goldstack-tfstate-ca11b7b5c625ed48b157a5943417ca07f2383cc7',
  'goldstack-tfstate-9c29553277cfa2cd18f6815de3390cd9f418c53e',
  'goldstack-tfstate-932408e0e7d82f178c5e83ab2f6530639f18357c',
  'goldstack-tfstate-f35403f3fc86e2c7e146d5bc15a189da63bdc5af',
  'goldstack-tfstate-d15f000d06696f10459684dc3bf99183c2a66a4a',
  'goldstack-tfstate-27efa8797927aa53b5e5ce7a1467c99b291762c6',
  'goldstack-tfstate-266108aa894f7c8db194139c65059e51028748ab',
  'goldstack-tfstate-3b34ffcb565a134df761054a10638ea5d472dc5f',
  'goldstack-tfstate-6147f1955e2c80ef97379fc845f76a755ea11a3c',
  'goldstack-tfstate-6a7eb1f5f6f68708c7e85c5b463510a32ebad6e8',
  'goldstack-tfstate-018ef25844920e01f41055ff0ab087ec9f34ca4b',
  'goldstack-tfstate-a0a3cc743d521f5cc3e9bed12b4b3f5586240314',
  'goldstack-tfstate-a247cf1298c3c5c1c78e47761945be2ae23e5927',
  'goldstack-tfstate-a3bf9d48f1e78aa28bc5488d02b96c763a03e144',
  'goldstack-tfstate-3c9555b5af76d6e7db89fe83e0eb920685acb377',
  'goldstack-tfstate-836dc511dd909bf4be8fae070865bd13c5095278',
  'goldstack-tfstate-91d42c93fe55f4180251097c693f8042efbdfdd8',
  'goldstack-tfstate-af27770bd70f0b25113e804b16002d2acbb349b2',
  'goldstack-tfstate-99c3a01b471cbc030322b2f1c9b702273f1f89b0',
  'goldstack-tfstate-4497a2a76cef9753b3d5a38ff996a60c51dd4330',
  'goldstack-tfstate-d09d71660ad312dfb04bfb58d4e0df437eceff3c',
  'goldstack-tfstate-25b15a540d9a1bb4924dda020e74b815aeea2634',
  'goldstack-tfstate-f36af23f2aad78825fb163fb94510b5e57a6d9ef',
  'goldstack-tfstate-65f96c2f86111515e707de846ff6b0145d7db80e',
  'goldstack-tfstate-c867fa9209c4346748e8d39735b1e2e50c687fc3',
  'goldstack-tfstate-0b32573cd7140147cf5d60b858c7dc180bd4e5bf',
  'goldstack-tfstate-6bab308586fb4aaa0a87fa0a2a2d3aea83baf4bb',
  'goldstack-tfstate-ce7330f80aa7480fc29f05f2d84ee0546beb6b79',
  'goldstack-tfstate-9e215622dd496879c0697dcc19acdaecf033f7db',
  'goldstack-tfstate-19d2e337df9976f60439d2129192817b6612ccfb',
  'goldstack-tfstate-fc2c1ae2367cc4a823bc0c0611d93b1ac578741a',
  'goldstack-tfstate-083ff96cb01e575120cdb02ac01c2b8da95368ea',
  'goldstack-tfstate-f4659b36f9f583c70a40a1bf2d4b0ee182bae6e5',
  'goldstack-tfstate-6c3405ca5542cb38aeb3a6f1feef7532315bc957',
  'goldstack-tfstate-2b85992c259ef90cd7554cc18bdf03012f7d2ea3',
  'goldstack-tfstate-98f90340207126dc49249f371c3ff2b62825f94b',
  'goldstack-tfstate-f1d6cb5807d291ffdaa62511d5be728dc7406ab9',
  'goldstack-tfstate-4b6314240988f4f0c45df2dba6cc70d02596259c',
  'goldstack-tfstate-ea0e83abd954a3a3723b23a9f1028e727d7069a6',
  'goldstack-tfstate-273477e7f521bc1b8c094b15c904e4e7310bb905',
  'goldstack-tfstate-429f6ee466929e6ff39b3042900f27905ee736fa',
  'goldstack-tfstate-aac13a6bd58f48f47efdac53a4adc1b2fcf67472',
  'goldstack-tfstate-60c0c0138920edd8e61d441a8344e967306e8ae7',
  'goldstack-tfstate-90e147f7fd5701c156e42d9048499e3008d0c949',
  'goldstack-tfstate-f674dbf865521e7ac1782fca798edf2e585037aa',
  'goldstack-tfstate-278f0afab45e4597a37c90e31228095e2c91d6cb',
  'goldstack-tfstate-4fa3243ade119202619c14038b085274952eacad',
  'goldstack-tfstate-ab95503a106fc5462f869ce7f7fe125d49c05995',
  'goldstack-tfstate-74e8d6d09d83b9e0c0cbfe0b372d488011ea8f5b',
  'goldstack-tfstate-4a8d9809ce0a844c260a1db53ab70252619b721e',
  'goldstack-tfstate-181b19793ed13c91c630321d4a83c1f336fa5fae',
  'goldstack-tfstate-cc252677179b2eb3c90ef3b0dca91b150ed37fd9',
  'goldstack-tfstate-ff9f5bd3769c5cd83a3c9f76787774f4cda26237',
  'goldstack-tfstate-a3b1672f637843f4911e5ad0f90ef95985625747',
  'goldstack-tfstate-f7efc335597dd1baa7da9ed3166b6f696b60789c',
  'goldstack-tfstate-5876888e7fae57b8545a6b5dd8922da75be6573f',
  'goldstack-tfstate-d268f1844398da360ba97bec093bda8901d6ba90',
  'goldstack-tfstate-8d7ef9a06b94a52ae8c36568181c0537c7c212e2',
  'goldstack-tfstate-c423e7e735b9b0c70457591f178a35b3ce97fef9',
  'goldstack-tfstate-5a71b5f74c531f97b2c7efc004ff25cb6330b16c',
  'goldstack-tfstate-427d2747727762d2123fb2ff4073236ff8e386d1',
  'goldstack-tfstate-c5141dfe755a58916c45557b00a0b9090f05f565',
  'goldstack-tfstate-7eb29aa374ed700eb876c4564ccea1104ea71239',
  'goldstack-tfstate-8a499e09d0e91c0ae870329a7ab3b770cb46a384',
  'goldstack-tfstate-78bae3e3a0b5379c8c30b9569c719f15b8615623',
  'goldstack-tfstate-816cb1f711df65bb02421bbaddf5c38ab976b6bf',
  'goldstack-tfstate-c9e967739f9a30f908b58911d1e808f68db472ef',
  'goldstack-tfstate-ddbabb895a8c7c86890482f6ead3581d164f6bb1',
  'goldstack-tfstate-bd2999732f71ac6cf7eec2db7c291428b48677bf',
  'goldstack-tfstate-fac3cfb7b757e4fbeec48561dc5df49514ecbd5b',
  'goldstack-tfstate-eb322725f88c711395f87be9f60ee4047afcc909',
];

(async () => {
  const deleteAllObjectsFromBucket = async (
    s3: S3Client,
    bucketName: string
  ): Promise<void> => {
    let continuationToken: string | undefined = undefined;
    do {
      // List objects in the bucket
      const listResponse = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          ContinuationToken: continuationToken,
        })
      );

      // Check if there are any objects to delete
      if (listResponse.Contents && listResponse.Contents.length > 0) {
        // Delete listed objects
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: listResponse.Contents.map((object) => ({
              Key: object.Key,
            })),
          },
        };
        await s3.send(new DeleteObjectsCommand(deleteParams));
      }

      // Check if more objects are to be listed (pagination)
      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);
  };

  const deleteS3Bucket = async (params: {
    s3: S3Client;
    bucketName: string;
  }): Promise<void> => {
    try {
      // First, delete all objects from the bucket
      await deleteAllObjectsFromBucket(params.s3, params.bucketName);

      // Then, delete the empty bucket
      await params.s3.send(
        new DeleteBucketCommand({ Bucket: params.bucketName })
      );
    } catch (e) {
      throw e; // Rethrow the error to handle it in the calling code if necessary
    }
  };

  const s3 = new S3Client({
    region: 'us-west-2',
  });

  for (const bucketName of bucketsToDelete) {
    console.log(`deleting ${bucketName}`);
    await deleteAllObjectsFromBucket(s3, bucketName);
    await deleteS3Bucket({ s3, bucketName });
  }
})();
