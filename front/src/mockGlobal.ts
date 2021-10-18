const mockedMediaStream: any = [];

export const mockedGetUserMedia = jest
  .fn()
  .mockReturnValue(Promise.resolve(mockedMediaStream));
