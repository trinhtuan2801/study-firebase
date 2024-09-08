export interface Dimensions {
  width: number;
  height: number;
}

export type ResizeImageFn = (
  blob: Blob,
  dimensions?: Dimensions,
) => Promise<Blob>;

export const resizeImage: ResizeImageFn = (
  blob,
  dimensions = {
    width: 480,
    height: 480,
  },
) => {
  return new Promise((resolve) => {
    const { width, height } = dimensions;
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas'),
        oc = document.createElement('canvas'),
        octx = oc.getContext('2d'),
        ctx = canvas.getContext('2d');

      const widthRatio = img.width / width;
      const heightRatio = img.height / height;
      const reduceRatio = Math.min(widthRatio, heightRatio);

      if (reduceRatio <= 1) resolve(blob);

      canvas.width = img.width / reduceRatio;
      canvas.height = img.height / reduceRatio;

      let cur = {
        width: Math.floor(img.width * 0.5),
        height: Math.floor(img.height * 0.5),
      };

      oc.width = cur.width;
      oc.height = cur.height;

      octx?.drawImage(img, 0, 0, cur.width, cur.height);

      while (cur.width * 0.5 > width) {
        cur = {
          width: Math.floor(cur.width * 0.5),
          height: Math.floor(cur.height * 0.5),
        };
        octx?.drawImage(
          oc,
          0,
          0,
          cur.width * 2,
          cur.height * 2,
          0,
          0,
          cur.width,
          cur.height,
        );
      }

      ctx?.drawImage(
        oc,
        0,
        0,
        cur.width,
        cur.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      });
    };
  });
};
