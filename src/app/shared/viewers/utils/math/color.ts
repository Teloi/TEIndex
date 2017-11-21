export class Color {
  /**
   * 按执行顺序可以分为以下六步：
   * 先执行Math.random() * 0x1000000，其中0x1000000=0xffffff+1，因为Math.random()取不到1，所以+1，这样就会生成一个1-16777216(不包含)以内的浮点数。
   * 然后执行<<0，这是取整运算，去掉后面的小数点。这时为一个16777216(不包含)以内的十进制数。
   * 之后执行.toString(16) ，把十进制数转化为六位以下16进制数。
   * 再后执行'00000'+，这时因为之前生成的16进制数最少可能仅一位，在前面加上5个0。
   * 最后执行.substr(-6) ，是去从-6开始的后面所有字符串，也就是最后6位数。
   * 前面加上#并retuen。
   * @returns {string}
   */
  static getRandomColor_16() {
    return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6);
  }
}
