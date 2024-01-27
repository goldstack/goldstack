import {
  S3Client,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

const bucketsToDelete = [
  'goldstack-tfstate-d28b1c08db048a42e81f948ce518b90047c7450f',
  'goldstack-tfstate-5d518fdb9dca71ffcae129a1a47624c6e71db659',
  'goldstack-tfstate-2f21c5fb8e62a14dac89cbaf75599c63dae8ab21',
  'goldstack-tfstate-e9d2cfb5dd4e73aaa4353fe9c3f9d378e9d83550',
  'goldstack-tfstate-f642e9e212fa4a6d4b86d2333946a728071f8321',
  'goldstack-tfstate-d4121c0df5037be8ea189f48a60fc1eec196c5e3',
  'goldstack-tfstate-dcbec2cd5a5434e765e9b54ebd8cc379c6073127',
  'goldstack-tfstate-2ba5029004c7dd5176847f0b85269db98277d341',
  'goldstack-tfstate-1e7c6c648bc6f3c969155c73702654b0fbe5ef8f',
  'goldstack-tfstate-2a87f180f2b39549dd7d6e5c12abd443f8dc4b4c',
  'goldstack-tfstate-6ee534066f72a4a360e34410dcabf6c529584505',
  'goldstack-tfstate-84216b5102627c9b98444ed51b9ab0907ea0500c',
  'goldstack-tfstate-6d7d42f2783e6488f32a9b6958cd622ef9d633e0',
  'goldstack-tfstate-ddbda01f38f7df42c24171a8ec9ab695a4e89cc0',
  'goldstack-tfstate-10568a97c5ce97ac0098c8f87ec4c9628a4e7200',
  'goldstack-tfstate-ad6ad5b108be916fb06d7785e3a5cb0e5154906a',
  'goldstack-tfstate-cafb6570b5a9978712088e1833a5604df0eca2ed',
  'goldstack-tfstate-73d87df35634bd5a8faa3572414703a901085c28',
  'goldstack-tfstate-390a19f19a9fe6b32ffe39795c60db1684c52828',
  'goldstack-tfstate-b0ed053cc44ed1813e717353633a600927de35a6',
  'goldstack-tfstate-896d644b653a28ca5d124f67835a40774aa88138',
  'goldstack-tfstate-ca192fe921e96c944afa0486e66b84e3b825b446',
  'goldstack-tfstate-00ae982ca84ffed23b90240f03544fff939a596d',
  'goldstack-tfstate-dc46495672516a9900f7c5f50c3c471ca292ccb4',
  'goldstack-tfstate-ec6acf4fb036b0522ab6e7ec05afa31f015cc905',
  'goldstack-tfstate-8e186dd457e221d317c2452048c58d19380d1f97',
  'goldstack-tfstate-41586e7773c39846c61be03ccf4fd3da2d82be83',
  'goldstack-tfstate-850717004b9ce4f0345a7ec824f8242b5e1d17d1',
  'goldstack-tfstate-d1b17318ae92f4f272edcf7a11824a26ce5d55b3',
  'goldstack-tfstate-f33f39b8a8dc6305c712b51afe202b26a0cc8a36',
  'goldstack-tfstate-0778274e96f4a4a3d1b70bd2d105ea216e3607fa',
  'goldstack-tfstate-58f307c358c524ce00b279ce49e9c0ed320e76a0',
  'goldstack-tfstate-408a804d936b421c33c5e789e1998298cd00f525',
  'goldstack-tfstate-3524fd061b5cfd19a5aec265c665147192d74e0f',
  'goldstack-tfstate-7c33f6d02e7fc621eeed5cf5ca74222783f143d2',
  'goldstack-tfstate-cc83621451d0b923cd4b6a68b6eb57ad3b6b6d5b',
  'goldstack-tfstate-2371e1919673f23f922de64f161375fe272038e2',
  'goldstack-tfstate-c8710141dcc8c5993589751d65352be2b77fc445',
  'goldstack-tfstate-292f2bd57e6e037ea9796cab379c066f9778197d',
  'goldstack-tfstate-a0eccd7185b611e1fdd60a246c573b1724a10f51',
  'goldstack-tfstate-01f264c43718b10eb72d4d4443acbfbdb6ab80b7',
  'goldstack-tfstate-116de51a1df8a5a1ff125e712bf4be553e915840',
  'goldstack-tfstate-6270e891ff8e843f0aa0f8abc1b5ed4d490f6978',
  'goldstack-tfstate-3f3c947bbd2bca43646f0dba177949d6aef5f03b',
  'goldstack-tfstate-248d430244d8df18034371f73f49687af56c79a9',
  'goldstack-tfstate-2d349e9208e85ff9ccc24b74dcf37642e07cde64',
  'goldstack-tfstate-f534ce1f53181fbf7ceb6930f8bb30d6de0cc1a8',
  'goldstack-tfstate-81d012013a074698b46481b8e03738a914901b60',
  'goldstack-tfstate-0ea9ccf534b2081c9616de44fa85747c6272665a',
  'goldstack-tfstate-e39125b2228c505611883ade6351b0c35bfd8609',
  'goldstack-tfstate-c0959af2ae9966157c23fc0c3745aa9a200c742a',
  'goldstack-tfstate-a2104c998be15d348ae9590b7db05e4d7b9e2f98',
  'goldstack-tfstate-2534cde258001be1b93ffc060f494d7574ee20e8',
  'goldstack-tfstate-c5199f6f1eabd7ad9ff8ac3330c2164b8087398b',
  'goldstack-tfstate-58c326a96fe1e72f6613be1e2a1c1338968938fa',
  'goldstack-tfstate-b4432596591565c8caee86771d23398fd38cabb7',
  'goldstack-tfstate-f43668226c16411219e5dcd1f5687ebd214b72e8',
  'goldstack-tfstate-f28dc75aad916a91f5d668e57186900421563263',
  'goldstack-tfstate-32944d195322387824fadb43397d0e232324b542',
  'goldstack-tfstate-a08115295902524ebb181f95225740da5121e737',
  'goldstack-tfstate-e3e674c480b0ebd2ca98a68473b1d795a0d6472b',
  'goldstack-tfstate-bf7800424cc5f4b1c2fc5bdbbe7fa12d39059e9d',
  'goldstack-tfstate-2dba052f7e64ec44ef3d1f8afd6cc6fbad282968',
  'goldstack-tfstate-796bc02062df1a353ce0067505f166ed497d19f2',
  'goldstack-tfstate-b5452cb4700f7e90aabdc7ae16f833bbdbb05603',
  'goldstack-tfstate-a280589c591e42f5618caf6fbeb51016e95c3eef',
  'goldstack-tfstate-6b2337f8cb1936b92fdc899d6f103a0c7705191f',
  'goldstack-tfstate-80c71a66b415846033e3008eeba475fc44fd5d99',
  'goldstack-tfstate-1642aec13c333310c98727f79ff5fd9070d0d982',
  'goldstack-tfstate-438c2b18326821b8b58d03b0fb696d6ab93e5c8d',
  'goldstack-tfstate-e191ee588ebc2ed03567efcb00ec55855e12ff0f',
  'goldstack-tfstate-76d0b3ebac241f7bc2facb8c8ebabf07e754e612',
  'goldstack-tfstate-54d240264b956a2c8bf23ccec0a0bf631007bf64',
  'goldstack-tfstate-0996208deb9c5d73bb33d8de73a3eab8ef1c7bb8',
  'goldstack-tfstate-651b7ade6974b87b9a62eb8aeff1dbb9da4c8492',
  'goldstack-tfstate-ad87c4f27ce53ec61c99aa4000ded04e44a4e951',
  'goldstack-tfstate-b39ea3af82133b5a79c1f99eea593c7db06e3f5e',
  'goldstack-tfstate-a1636d09bc6f7a2d57eefcdfe62e229826531674',
  'goldstack-tfstate-5966ecf155ea80f8f6145ee8029150fd31815d3c',
  'goldstack-tfstate-3511649996b916635a307af474d05d9c2d6295eb',
  'goldstack-tfstate-5583cb12411417214ef3b53cc30eeb42da9a8c75',
  'goldstack-tfstate-0acb9001ff086c2f86f2199cffb8fa3300316efc',
  'goldstack-tfstate-01777fcdf29b380bf86d593cc7d3a553cee6828f',
  'goldstack-tfstate-e8241701160426666fe38446d95c98d94f155ae7',
  'goldstack-tfstate-42f5298e715cebe905c458314cdfea3688687858',
  'goldstack-tfstate-5600443fd1c5b35cebcd282adc3e06162f12162a',
  'goldstack-tfstate-fd1beebcc568b3a18420fa4616d1374c6001f223',
  'goldstack-tfstate-bd9670434d792860ddcef93edd7b532c531e3cd0',
  'goldstack-tfstate-6da362c7876a1d76e5ee398fb79e320aba07f916',
  'goldstack-tfstate-2256fb0aafaeed78ae7f9aacead6c7e745be5519',
  'goldstack-tfstate-c99218cee15d0b37846e4b7cbaf62deb4d380fa5',
  'goldstack-tfstate-289cbb123beafe18ff7d485c7cc86ab511c88b22',
  'goldstack-tfstate-a8782f0b77fd41bc92f5e5f00e5b7402b283900e',
  'goldstack-tfstate-964b0997037bcf8bd68ab676753c8f3d5a9a9e11',
  'goldstack-tfstate-6026ae1454719de4bccc1dc65b7462d00aa00ca3',
  'goldstack-tfstate-e12fc0a4a2ceea0ea9616ee62a7b3fa4cea14e7e',
  'goldstack-tfstate-a1b0b082f3b0eb6ca97d7c8eeead142fc2329f23',
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
