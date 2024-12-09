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
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create contact');
  }
};

const getContactFromDB = async () => {
  const result = await Contact.findOne();

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Contact not found');
  }

  return result;
};

export const ContactService = {
  createContactToDB,
  getContactFromDB,
};
