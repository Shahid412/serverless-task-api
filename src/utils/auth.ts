// src/utils/auth.ts

import { APIGatewayProxyEvent } from 'aws-lambda';

/**
 * Extracts the User ID from the Lambda event's authorizer claims.
 * @param event API Gateway event.
 * @returns User ID (sub) or null.
 */
export const getUserId = (event: APIGatewayProxyEvent): string | null => {
  console.log('Getting UserID... ');
  console.log(1, event.requestContext);
  console.log(2, event.requestContext.authorizer);
  console.log(3, event.requestContext.authorizer?.claims);
  if (
    event.requestContext &&
    event.requestContext.authorizer &&
    event.requestContext.authorizer.claims &&
    event.requestContext.authorizer.claims.sub
  ) {
    return event.requestContext.authorizer.claims.sub;
  }
  return null;
};
