import { SILENCIO_HAUNTED_HOUSE_QUEUE_MANAGER_URL } from "./constants";

export default function SUCCESS_EMAIL_TEMPLATE({
  name,
  email,
  studentId,
  eventDay,
  eventYear,
  homeroom,
  bannerImage,
  eventName,
  ticketType,
  purchaseTime,
  eventType,
}: {
  name: string;
  email: string;
  studentId: string;
  eventDay: string;
  eventYear: string;
  homeroom: string;
  bannerImage: string;
  eventName: string;
  ticketType: string;
  eventType: "Silencio" | "PROM";
  purchaseTime: string;
}) {
  const EMAIL = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
 <head>
  <!--  -->
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VTEAM</title>
  <style>
   body { margin: 0 !important; min-width: 100% !important; padding: 0 !important; width: 100% !important; }
   
   body, table, td, a, h1, h2, h3, h4, h5, h6, p { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
   
   img { border: 0; height: auto; line-height: 100%; }
   
   sup { font-size: 45%; line-height: 0; }
   
   u + .email-body #new-gmail-hack { display: block !important; }
   
   span.outlook-overflow-scaling { width: 100% !important; max-width: 100%; padding: 0 !important; }
   
   #MessageViewBody, #MessageWebViewDiv { margin: 0 !important; min-width: 100vw; padding: 0 !important; zoom: 1 !important; }
   
   #MessageViewBody #backgroundTable { min-width: 100vw; }
   
   .main div.contentcell { width: 640px; }
  </style>
  <style>
   @import url("https://fonts.googleapis.com/css?family=Roboto+Slab:400,700");
   @import url("https://fonts.googleapis.com/css?family=Roboto:400,700");
   a, a:link { color: #000000; text-decoration: none; }
   
   h1, h2 { font-family: 'Roboto Slab', Rockwell, Arial, sans-serif; }
   
   p { font-family: 'Roboto', Arial, sans-serif; }
   
   li { text-align: -webkit-match-parent; display: list-item; }
   
   .email-body { background-color: #eaeaea; }
   
   .viz { display: none; }
   
   .padd-swap { padding: 20px 0px !important; }
   
   .bull-list { border-top: none !important; border-left: 10px solid #009cde; padding: 10px 18px 0px !important; }
   
   .full-300 img { width: 300px !important; }
   
   .full-290 img { width: 290px !important; }
   
   .full-200 img { width: 200px !important; }
   
   .logo-lockup { padding: 8px 30px 8px 0px !important; }
   
   .logo-desk { display: inline-block!important; height: inherit !important; }
   
   .logo-mob { display: none; height: 0; overflow: hidden; }
   
   .logo-partner { border-bottom: none !important; border-left: 1px solid #000000; padding: 0px 0px 0px 30px !important; }
   
   .logos-wrapper { font-size: 0; text-align: left; }
   .logos-wrapper .column1, .logos-wrapper .column2 { display: inline-block; width: auto; text-align: left; vertical-align: middle; }
   
   .partners-wrapper { font-size: 0; text-align: left; }
   .partners-wrapper .column1, .partners-wrapper .column2 { display: inline-block; width: auto; text-align: left; vertical-align: middle; }
   
   .stack-wrapper { font-size: 0; text-align: center; }
   .stack-wrapper .column1, .stack-wrapper .column2, .stack-wrapper .column3 { display: inline-block; width: 100%; vertical-align: top; }
   
   .twoc .column1, .twoc .column2 { width: 300px; }
   
   .twoh .column1 { width: 200px; }
   .twoh .column2 { width: 400px; }
   
   .twoi .column1 { width: 240px; }
   .twoi .column2 { width: 360px; }
   
   .twol .column1 { width: 360px; }
   .twol .column2 { width: 240px; }
   
   .tweec .column1, .tweec .column2 { width: 290px; }
   .tweec .column3 { width: 20px; }
   
   .threec .column1, .threec .column2, .threec .column3 { width: 193px; }
   
   .threel .column1, .threel .column2, .threel .column3 { width: 186px; }
   
   @media only screen and (max-width: 639px) { .viz { display: table; }
     .padd-swap { padding: 0px 20px !important; }
     .bull-list { border-top: 10px solid #009cde !important; border-left: none !important; padding: 18px 4px 8px !important; }
     .full-300 img { width: 100% !important; }
     .full-290 img { width: 100% !important; }
     .full-200 img { width: 100% !important; }
     .logo-lockup { padding: 0px 0px 16px !important; }
     .logo-desk { display: none !important; height: 0 !important; }
     .logo-mob { display: inline-block; height: inherit; overflow: hidden; }
     .logo-partner { border-bottom: 1px solid #000000 !important; border-left: none !important; padding: 16px 0px !important; }
     .logos-wrapper { font-size: 0; text-align: center; }
     .logos-wrapper .column1, .logos-wrapper .column2 { display: inline-block; width: 100%; text-align: center; vertical-align: top; }
     .partners-wrapper { font-size: 0; text-align: center; }
     .partners-wrapper .column1, .partners-wrapper .column2 { display: inline-block; width: auto; text-align: center; vertical-align: top; }
     .twoc .column1, .twoc .column2, .twoc .column3, .twoh .column1, .twoh .column2, .twoh .column3, .twoi .column1, .twoi .column2, .twoi .column3, .twol .column1, .twol .column2, .twol .column3, .tweec .column1, .tweec .column2, .tweec .column3, .threec .column1, .threec .column2, .threec .column3, .threel .column1, .threel .column2, .threel .column3 { width: 100%; } }
  </style>
  


  <!--[if !mso]><!-->
  <style>
   a[x-apple-data-detectors] { color: inherit !important; font-family: inherit !important; font-size: inherit !important; font-weight: inherit !important; line-height: inherit !important; text-decoration: none !important; }
  </style>
  <!--<![endif]-->
  <!--[if (gte mso 9)|(IE)]>   
<style>    table { border-collapse: collapse; }        table, td { mso-line-height-rule: exactly; mso-margin-bottom-alt: 0; mso-margin-top-alt: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }        div { margin: 0; padding: 0; }        sup { font-size: 75%; mso-text-raise: 12%; }        h1, h2 { font-family: Rockwell, Arial, sans-serif !important; }        p, a { font-family: Arial, sans-serif !important; }        li { text-align: -webkit-match-parent; display: list-item; text-indent: -1em; margin: 12px; }        .viz { display: none !important; }        .logo-desk { display: block !important; height: inherit !important; }        .logo-partner { border-bottom: none !important; border-left: none !important; border-right: 1px solid #000000; }        .bull-list { font-family: Arial,
 sans-serif !important; }   </style>   <![endif]-->
  <!--[if gte mso 9]>   <xml>    <o:OfficeDocumentSettings>     <o:AllowPNG/>     <o:PixelsPerInch>96</o:PixelsPerInch>    </o:OfficeDocumentSettings>   </xml>   <![endif]-->
 </head>
 <body class="email-body"><style type="text/css">
div.preheader 
{ display: none !important; } 
</style>
<div class="preheader" style="font-size: 1px; display: none !important;">Vui lòng kiểm tra lại đơn hàng của bạn.</div>
  <div style="display: none; max-height: 0px; overflow: hidden;">
   
  
 &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>
  <div style="height: 1px; overflow: hidden;"><img src="https://click.e.collegeboard.org/open.aspx?ffcb10-fe8f157472600c7d7d-fe0e10767d6c0d75721279-fe4115707564047b751370-ff5f117977-fe2b1076736c067c771477-ff0a1570756400&d=100215&bmt=0" width="1" height="1" alt=""></div>
  <table id="backgroundTable" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #eaeaea;">
   <tr>
    <td align="center">
     <table border="0" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
       <td class="main" align="center" style="width: 640px;">

        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
 
    <tr>
     <td align="center" style="padding: 20px 20px 0px;">
      <!-- Hero bgcolor="#" Here --><table bgcolor="#006298" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
       
        <tr>
         <td>
          <!-- Logo Lockup --><!-- Logo bgcolor="#" Here --><table bgcolor="#000000" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tr>    
             <td>
              <table border="0" cellpadding="0" cellspacing="0" role="presentation">
               
                <tr>
                 <!-- Logo Here --><td bgcolor="#000000" style="font-size: 0; line-height: 0;">
                   <img alt="VTEAM" src="${bannerImage}" style="display: block; margin: 0px; border: 0px; padding: 0px; width: 100%;font-family: Arial, sans-serif; font-size: 18px; text-align: center; color: #ffffff;" width="604"></td></tr></table></td></tr></table></td></tr><tr>
         <td>
         </td></tr></table>
      </td></tr>
  </table>
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
 
  <tr>
   <td align="center" style="padding: 20px 20px 0px;">
    <!-- Hero bgcolor="#" Here --><table bgcolor="#006298" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
     
      <tr>
       <td>
        <!-- Logo Lockup --><!-- Logo bgcolor="#" Here --><table bgcolor="#000000" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
         
          <tr>
           <td>
            <table border="0" cellpadding="0" cellspacing="0" role="presentation">
             
              <tr>
               <!-- Logo Here --><td bgcolor="#000000" style="font-size: 0; line-height: 0;padding: 10px;">
                <!-- Desktop Logo --><div class="logo-desk" style="display: none; height: 0; overflow: hidden;">
                 <a  href="https://www.facebook.com/vteam.vcp" target="_blank"><img alt="VTEAM" src="C:\Users\Chinh\Downloads\Untitled design (1).png" style="display: block; margin: 0px; border: 0px; padding: 0px; width: 304px;filter:invert(1); font-family: Arial, sans-serif; font-size: 18px; text-align: center; color: #ffffff;" width="304"></a></div><!-- Mobile Logo --><!--[if !mso|(IE)]><!--><div class="logo-mob">
                 <a  href="https://www.facebook.com/vteam.vcp" target="_blank"><img alt="" src="C:\Users\Chinh\Downloads\Untitled design (1).png" style="display: block; margin: 0px; border: 0px; padding: 0px; width: 300px;filter:invert(1);" width="300"></a></div><!--<![endif]--></td><!-- Logo Ends --></tr></table></td></tr></table><!-- Logo Lockup --></td></tr><tr>
       <td>
       </td></tr></table>
    </td></tr>
</table>

        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="min-width: 100%; " class="stylingblock-content-wrapper"><tr><td class="stylingblock-content-wrapper camarker-inner"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
	
		<tr>
			<td align="center" style="padding: 0px 20px 10px;">
				<!-- One-Column --><table bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
					
						<tr>
							<td align="center" style="padding: 20px;">
								<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
									<!-- Bodycopy Here -->
										<tr>
											<td align="left" style="padding: 0px 0px 12px;">
												<p style="font-family: Roboto, Arial, sans-serif; font-size: 20px; font-weight: normal; line-height: 22px; letter-spacing: 0.25px; color: #000000; text-align: justify; margin: 0px; padding: 0px;">
													Xin chào bạn ${name}, <br>
													<br>
													Trước tiên, Hội Đồng Học Sinh VCP xin chúc mừng bạn đã mua vé <span style="color:darkgreen;font-weight:bold;">thành công </span> cho sự kiện PROM. Xin bạn vui lòng kiểm tra lại thông tin cá nhân của bạn ở bên dưới. <span style="color:crimson;font-weight: bold;">Nếu phát hiện bất kỳ sai sót nào</span>, hãy liên hệ với chúng mình ngay bằng cách trả lời email này!</p></td></tr><!-- Bodycopy Ends --><tr>
											
                                                            </tr><!-- Bodycopy Here --><tr>
											<tr><td align="left" style="padding: 0px 0px 12px;border:1px dashed black;border-radius: 10px;padding:10px;background: rgba(0,0,0,0.02);">
                                                <p style="font-family: Roboto, Arial, sans-serif; font-size: 18px; font-weight: normal; line-height: 30px; color: #000000; text-align: left; margin: 0px; padding: 0px;">
                                                    Thời gian mua vé: <span style="font-weight: bold;">${purchaseTime}</span></p>
                                                    <p style="font-family: Roboto, Arial, sans-serif; font-size: 18px; font-weight: normal; line-height: 30px; color: #000000; text-align: left; margin: 0px; padding: 0px;">
                                                        Tên sự kiện: <span style="font-weight: bold;">${eventName}</span></p>
                                                        <p style="font-family: Roboto, Arial, sans-serif; font-size: 18px; font-weight: normal; line-height: 30px; color: #000000; text-align: left; margin: 0px; padding: 0px;">
                                                            Hạng vé: <span style="font-weight: bold;">${ticketType}</span></p>
                                                    <p style="font-family: Roboto, Arial, sans-serif; font-size: 18px; font-weight: normal; line-height: 30px; color: #000000; text-align: left; margin: 0px; padding: 0px;">
                                                        Tên người mua: <span style="font-weight: bold;">${name}</span></p>
                                                        <p style="font-family: Roboto, Arial, sans-serif; font-size: 18px; font-weight: normal; line-height: 30px; color: #000000; text-align: left; margin: 0px; padding: 0px;">
                                                            Lớp: <span style="font-weight: bold;">${homeroom}</span></p>
                                                            <p style="font-family: Roboto, Arial, sans-serif; font-size: 18px; font-weight: normal; line-height: 30px; color: #000000; text-align: left; margin: 0px; padding: 0px;">
                                                                Mã số HS: <span style="font-weight: bold;">${studentId}</span></p>
                                                        <p style="font-family: Roboto, Arial, sans-serif; font-size: 18px; font-weight: normal; line-height: 30px; color: #000000; text-align: left; margin: 0px; padding: 0px;">
                                                            Email: <span style="font-weight: bold;">${email}</span></p>
   
                                                </td> </tr>
                                                <tr><td align="left" style="padding: 12px 0px 12px;">
                                                    <p style="font-family: Roboto, Arial, sans-serif; font-size: 20px; font-weight: normal; line-height: 22px; letter-spacing: 0.25px; color: #000000; text-align: justify; margin: 0px; padding: 0px;">
                                                        Trong thời gian sắp tới, trước ngày sự kiện <span style="font-weight: bold;">${eventDay}</span>, chúng mình sẽ tiếp tục gửi đến bạn các thông tin cập nhật và nhắc nhở thông qua email này.</p>
                                                </td> </tr>

                                                ${
                                                  eventType === "Silencio"
                                                    ? `
                                                <tr><td align="left" style="padding: 12px 0px 12px;">
                                                    <p style="font-family: Roboto, Arial, sans-serif; font-size: 20px; font-weight: normal; line-height: 22px; letter-spacing: 0.25px; color: #000000; text-align: justify; margin: 0px; padding: 0px;">
                                                        Tuy nhiên trước hết, để cho sự kiện Silencio được diễn ra suôn sẻ và thuận lợi. Bạn hãy truy cập trang web này để lấy số thứ tự của bạn khi chơi nhà ma tại Silencio càng sớm càng tốt nhé. Nếu bạn chưa lấy số thứ tự trước deadline, vào hôm on-event bạn sẽ phải đi theo số thứ tự ngẫu nhiên: <a href="${SILENCIO_HAUNTED_HOUSE_QUEUE_MANAGER_URL}" target="_blank" rel="noopener" referrerpolicy="no-referrer" style="color:crimson;font-weight: bold;">${SILENCIO_HAUNTED_HOUSE_QUEUE_MANAGER_URL}</a></p>

                                                </td> </tr>
                                                `
                                                    : null
                                                }

                                                <tr><td align="left" style="padding: 12px 0px 12px;">
                                                    <p style="font-family: Roboto, Arial, sans-serif; font-size: 20px; font-weight: normal; line-height: 22px; letter-spacing: 0.25px; color: #000000; text-align: justify; margin: 0px; padding: 0px;">
                                                       <span style="color:crimson;font-weight: bold;">Xin lưu ý</span>, vui lòng không chia sẻ vé hay foward email này cho người khác vì lợi ích của bạn!</p>
                                                </td> </tr>

                                                <tr><td align="left" style="padding: 12px 0px 12px;">
                                                    <p style="font-family: Roboto, Arial, sans-serif; font-size: 20px; font-weight: normal; line-height: 22px; letter-spacing: 0.25px; color: #000000; text-align: right; margin: 0px; padding: 0px;font-style: italic;text-decoration: underline;">
                                                        VTEAM xin trân trọng cảm ơn.</p>
                                                </td> </tr>
                                            </tr><!-- Bodycopy Ends --></table></td></tr></table></td></tr></table></td></tr></table>
        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="min-width: 100%; " class="stylingblock-content-wrapper"><tr><td class="stylingblock-content-wrapper camarker-inner"><span style="font-size: medium;">  </span>
            
            
<table align="center" bgcolor="#000000" border="0" cellpadding="0" cellspacing="0" role="presentation" width="94%">
    
        <td align="center" style="padding: 10px 0px 10px;">
    </td><!-- Social --></tr><tr>
		<tr>
			<td align="center" style="padding: 5px 5px 5px;">
				<a  href="https://www.facebook.com/vteam.vcp" target="_blank"><img alt="VTEAM" src="https://vteam-online-ticket.vercel.app/_next/image?url=%2Fassets%2Flogo.webp&w=256&q=75" style="display: block; margin: 0px;margin-top: -20px; border: 0px;margin-right: 20px; padding: 0px; width: 100px; font-family: Arial, sans-serif; font-size: 18px; color: #ffffff;filter:invert(1);" width="100"></a></td></tr><tr>
                    
		<tr>
			
            <td align="center" style="padding: 5px 0px 5px;">
            </td></tr><!-- Footer --><tr>
			<td align="center" style="padding: 0px 10px 18px; font-family: Arial, sans-serif; font-size: 20px; line-height: 1;">
				<a target="_blank" rel="noopener" referrerpolicy="no-referrer"  data-linkto="https://" href="https://www.facebook.com/vteam.vcp" style="display: inline-block;" title=""><img alt="Facebook" data-assetid="35553" height="36" src="https://image.e.collegeboard.org/lib/fe3d15707564047b751077/m/1/7471b7fb-c6eb-463e-936f-0e3475235c61.png" style="display: block; margin: 0px; width: 36px; padding: 0px; text-align: center; height: 36px; border: 0px;" width="36"></a>&nbsp;&nbsp;<a target="_blank" referrerpolicy="no-referrer" rel="noopener"  data-linkto="https://" href="https://www.instagram.com/vteam.vcp" style="display: inline-block;" title=""><img alt="Instagram" data-assetid="35550" height="36" src="https://image.e.collegeboard.org/lib/fe3d15707564047b751077/m/1/090ac7c2-388d-4788-830f-9c51eb260cd3.png" style="display: block; margin: 0px; width: 36px; padding: 0px; text-align: center; height: 36px; border: 0px;" width="36"></a>&nbsp;
                <a  rel="noopener" target="_blank" referrerpolicy="no-referrer" data-linkto="https://" href="https://www.tiktok.com/@_vteam.vcp_" style="display: inline-block;" title="">
<img alt="Tiktok" data-assetid="35550" height="36" src="https://image.e.collegeboard.org/lib/fe3d15707564047b751077/m/1/0aa231d1-b65b-46d6-94c2-c8116246f387.png" style="display: block; margin: 0px; width: 36px; padding: 0px; text-align: center; height: 36px; border: 0px;" width="36"></a>&nbsp;&nbsp;<a  target="_blank" referrerpolicy="no-referrer" rel="noopener" data-linkto="https://" href="https://open.spotify.com/show/6HyeZrRlgEZPkXT09TPqJu?si=9ba07dbd1a5948f0" style="display: inline-block;" title=""><img alt="Spotify" data-assetid="35550" height="36" src="C:\Users\Chinh\Downloads\spotify.png" style="display: block; margin: 0px; width: 36px; padding: 0px; text-align: center; height: 36px; border: 0px;" width="36"></a>&nbsp; 
&nbsp;&nbsp;</td></tr><!-- end Social --><!-- bottom of footer start-->
			<td align="center" style="padding: 0px 0px 10px;">
				<p style="font-family: Arial, sans-serif; font-size: 12px; font-weight: normal; line-height: 12px; color: #ffffff; text-align: center; margin: 5px; padding: 5px;">
					Khu đô thị Vinhomes Central Park, Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh<br>
					<br>
					&copy; <span>${eventYear}</span>&nbsp;VTEAM</p></td></tr><tr>
			<td>
			 </custom></td></tr></table><!-- bottom of footer end--></td></tr></table>
       </td>
      </tr>
     </table>
    </td>
   </tr>
   <tr>
    <td>
     
    </td>
   </tr>
  </table>
  <section>
   <div id="new-gmail-hack" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
   </div>
  </section>
  
 
 </body>
</html>
`;
  return EMAIL;
}
