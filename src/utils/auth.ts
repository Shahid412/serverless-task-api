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
  // console.log(3, event.requestContext.authorizer.claims);
  // console.log(4, event.requestContext);
  if (
    event.requestContext &&
    event.requestContext.authorizer &&
    event.requestContext.authorizer.jwt &&
    event.requestContext.authorizer.jwt.claims &&
    event.requestContext.authorizer.jwt.claims.sub
  ) {
    return event.requestContext.authorizer.jwt.claims.sub;
  }
  return null;
};
