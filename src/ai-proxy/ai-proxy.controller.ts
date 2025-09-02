import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import axios from 'axios';

@Controller('ai-proxy')
export class AiProxyController {
  @Post('predict')
  async predict(@Body() body: any) {
    const aiApiUrl =
      'https://allergen-status-of-food-products.onrender.com/predict';

    try {
      const response = await axios.post(aiApiUrl, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch data from external AI API',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
