package com.jobportal.Job.Portal.utility;

public class Data {

    public static String getMessageBody(String otp, String name) {

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='UTF-8'>" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "  <title>OTP Verification</title>" +
                "</head>" +

                "<body style='margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;'>" +

                "<table width='100%' cellpadding='0' cellspacing='0' style='padding:20px 0;'>" +
                "  <tr>" +
                "    <td align='center'>" +

                "      <table width='480' cellpadding='0' cellspacing='0' style='background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);'>" +

                "        <tr>" +
                "          <td style='background:#2E7D32; padding:15px; text-align:center; color:#ffffff; font-size:20px; font-weight:bold;'>" +
                "            Job Portal" +
                "          </td>" +
                "        </tr>" +

                "        <tr>" +
                "          <td style='padding:25px; color:#333333;'>" +

                "            <p style='margin:0 0 10px;'>Hello " + name + ",</p>" +

                "            <p style='margin:0 0 15px;'>Use the following One-Time Password (OTP) to complete your verification:</p>" +

                "            <div style='text-align:center; margin:25px 0;'>" +
                "              <span style='display:inline-block; font-size:30px; letter-spacing:6px; font-weight:bold; color:#2E7D32; background:#f1f8f4; padding:10px 20px; border-radius:8px;'>" +
                otp +
                "              </span>" +
                "            </div>" +

                "            <p style='margin:0 0 10px;'>This OTP is valid for <b>5 minutes</b>.</p>" +
                "            <p style='margin:0 0 20px;'>Do not share this code with anyone.</p>" +

                "            <p style='margin:0;'>If you did not request this, you can safely ignore this email.</p>" +

                "          </td>" +
                "        </tr>" +

                "        <tr>" +
                "          <td style='background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#777;'>" +
                "            © 2026 JobHook. All rights reserved.<br/>" +
                "            Need help? Contact support." +
                "          </td>" +
                "        </tr>" +

                "      </table>" +

                "    </td>" +
                "  </tr>" +
                "</table>" +

                "</body>" +
                "</html>";
    }
}