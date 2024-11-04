import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IContact } from './contact.interface';
import { Contact } from './contact.model';

const createContactToDB = async (payload: Partial<IContact>) => {
  try {
    const existingContact = await Contact.findOne();

    if (existingContact) {
      const { image, ...remainingData } = payload;

      const modifiedUpdateData: Record<string, unknown> = {
        ...remainingData,
      };

      if (image && image.length > 0) {
        const updatedImages = [...existingContact.image];

        // Update only specified images by index
        image.forEach((newImage, index) => {
          if (newImage) {
            updatedImages[index] = newImage;
          }
        });

        // Assign the updated images array to the update data
        modifiedUpdateData.image = updatedImages;
      }

      // Apply updates to the existing contact
      Object.assign(existingContact, modifiedUpdateData);
      const updatedContact = await existingContact.save();
      return updatedContact;
    } else {
      // If no existing contact, create a new one
      const newContact = await Contact.create(payload);
      return newContact;
    }
  } catch (error) {
    throw new Error('Unable to create or update contact.');
  }
};

// const updateContactToDB = async (id: string, payload: Partial<IContact>) => {
//   const result = await Contact.findByIdAndUpdate(id, payload, {
//     new: true,
//     runValidators: true,
//   });

//   if (!result) {
//     throw new ApiError(StatusCodes.UNAUTHORIZED, 'Failed to update contact');
//   }

//   return result;
// };

const getContactFromDB = async () => {
  const result = await Contact.findOne();

  return result;
};

export const ContactService = {
  createContactToDB,
  getContactFromDB,
};
