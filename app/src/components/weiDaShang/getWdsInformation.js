const cheerio = node_require('cheerio');

/**
 * 获取微打赏的信息
 * @param { string } wdsId: 微打赏ID
 */
function getWdsInformation(wdsId: string): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    $.ajax({
      type: 'GET',
      url: `https://wds.modian.com/show_weidashang_pro/${ wdsId }#1`,
      cache: true,
      dataType: 'text',
      success: function(data: string, status: string, xhr: XMLHttpRequest): void{
        const xml: string = cheerio.load(data);
        const title: string = xml('span.title').text();
        const moxiId: string = xml('#look_user_id').attr('moxi_id');
        resolve({
          title,
          moxiId
        });
      },
      error: function(err: any): void{
        reject(err);
      }
    });
  });
}

export default getWdsInformation;