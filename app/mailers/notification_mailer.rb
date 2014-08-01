require 'digest/sha2'
class NotificationMailer < ActionMailer::Base
  default "from"=>"notification@icages.usc.edu", "Message-ID"=>"#{Digest::SHA2.hexdigest(Time.now.to_i.to_s)}@icages.usc.edu"

  def job_done(submission)
     @url = result_path(submission, only_path:false)
     logger.debug "Email is sent to #{submission.email} !"
     mail(to: submission.email, subject: '[iCAGES]Your result is here')
  end	
     
end
