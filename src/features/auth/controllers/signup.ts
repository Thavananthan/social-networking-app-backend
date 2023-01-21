import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '../../../shared/globals/helpers/error-handler';
import { Helpers } from '../../../shared/globals/helpers/helpers';
import { ISignUpData } from '../interfaces/auth.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '../../../shared/globals/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Inavalid credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;

    // call private methoder here
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });

    const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;

    if (!result?.public_id) {
      throw new BadRequestError('File upload : Error occurred. Try again');
    }

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User created successfully',
      authData
    });
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;

    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowercase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }
}
