import unlinkFile from '../../../shared/unlinkFile';

export const Gender = ['Male', 'Female', 'Other', 'All'];

export const InfluencerSearchAbleFields = [
  'address',
  'category',
  'city',
  'code',
  'country',
  'email',
  'image',
  'name',
  'owner',
  'phnNum',
  'whatAppNum',
  'manager',
  'instagram',
];

export const filterImages = (
  existingImages: string[],
  imagesToDelete: string[]
) => {
  return existingImages.filter(image => !imagesToDelete.includes(image));
};

// Helper function to remove files from the server
export const removeFiles = async (imagesToDelete: string[]) => {
  for (let image of imagesToDelete) {
    await unlinkFile(image); // Assuming unlinkFile is an async function
  }
};
