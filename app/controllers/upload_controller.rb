class UploadController < ApplicationController 
  protect_from_forgery except: :handle_upload
  before_filter :add_cross_origin_headers, :only => [:handle_upload, :options]
  Thread::abort_on_exception = true

  def index
  end

  def options
    head :ok
  end
    

  def handle_upload

    inputData = params[:inputData]

    inputFile = params[:inputFile]

    subtype = params[:subtype] || ''

    email = params[:email] || ''
    
    logger.debug "Input file is [#{'empty' if inputFile.nil?}].." 

    email_msg = email.empty? ? '':'for ' + email

    if inputData
      submission = Submission.create(done: false, email: email)
      t = Thread.new { exec_query(submission.id, inputData, {isFile: false, subtype: subtype}) }
      #t.join
      render json: {id: submission.id, msg:"Submission: #{submission.id} created #{email_msg} url: #{result_path(submission, only_path: false)}"}
    elsif inputFile
      submission = Submission.create(done: false, email: email)
      t = Thread.new { exec_query(submission.id, inputFile, subtype, {isFile: true, subtype: subtype}) }
      #t.join
      render json: {id: submission.id, msg: "File: #{inputFile.original_filename} uploaded, Submission: #{submission.id} created #{email_msg}"}
    end
    
  end

  private 
  
  def exec_query(id, data, opts)
	
    logger.debug "I'm here!!!"

    config = CONFIG['script']
    File.open(CONFIG['script']['input_dir'] + "/input-#{id}.txt",'w') do |file|
      file.write(opts[:isFile] ? data.read : data)
    end

    logger.debug opts[:subtype]

    subtypeOpt = opts[:subtype].empty? ? "" : "-s #{opts[:subtype]}"

    perlCmd = "perl #{config['path']} -i #{id} #{subtypeOpt} #{config['input_dir']} #{config['output_dir']} #{config['temp_dir']} #{config['log_dir']}"

    logger.debug perlCmd

    `#{perlCmd}`

    if $?.exitstatus != 0
      logger.debug "\n---- Perl execution error!\n"
      return
    end

    if not File.exist?("#{config['output_dir']}/result-#{id}.json")
      logger.debug "\n---- Result json not found!\n"
      return
    end

    ActiveRecord::Base.connection_pool.with_connection do
      submission = Submission.find(id)
      submission.update(done: true)
      NotificationMailer.job_done(submission).deliver unless submission.email.empty?
    end
  
  end

end

