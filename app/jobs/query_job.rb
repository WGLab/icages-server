class QueryJob < ActiveJob::Base
  queue_as :default

  def perform(perlCmd, submission_id, output_path)

    `#{perlCmd}`

    if $?.exitstatus != 0
      logger.debug "\n---- Perl execution error!\n"
      return
    end

    if not File.exist?("#{output_path}/input-#{submission_id}.icages.json")
      logger.debug "\n---- Result json not found!\n"
      return
    end

    ActiveRecord::Base.connection_pool.with_connection do
      submission = Submission.find(submission_id)
      submission.update(done: true)
      NotificationMailer.job_done(submission).deliver unless submission.email.empty?
    end
  end
end
