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
    isFileUpload = false

    logger.debug "Input file is [#{'empty' if inputFile.nil?}].." 

    email = params[:email]
    
    emailMsg = (!email || email.empty?) ? '':'for ' + email

    submission = Submission.create(done: false, email: email)

    responseMsg = ""
    if inputData && !inputData.empty?
      responseMsg = "Submission: #{submission.id} created #{emailMsg}"
    else 
      responseMsg = "File: #{inputFile.original_filename} uploaded, Submission: #{submission.id} created #{emailMsg}"
      isFileUpload = true
    end

    
    t = Thread.new { exec_query(submission.id, isFileUpload, params) }
    render json: {id: submission.id, msg: responseMsg, url: "#{result_path(submission, only_path: false)}"}
    
  end

  private 

  def getShell(config, params, inputFilePath)
    options = {
      :tumorSampleID => "-t",
      :gemlineSampleID => "-g",
      :multiSampleID => "-i",
      :subtype => "-s"
    }

    perlCmd = "perl #{config['path']}"

    options.each do |k, v|
      if params[k] && !params[k].empty?
        perlCmd += " #{v} #{params[k]}"
      end
    end

    perlCmd += " --logdir #{config['log_dir']} --tempdir #{config['temp_dir']} --outputdir #{config['output_dir']} #{inputFilePath}"
  end
  
  def exec_query(id, isFileUpload, params)
	
    logger.debug "I'm here!!!"



    config = CONFIG['script']

    inputFilePath = config['script']['input_dir'] + "/input-#{id}.txt"
    File.open(inputFilePath,'w') do |file|
      file.write(isFileUpload ? params[:inputFile].read : params[:inputData])
    end

    logger.debug params

    perlCmd = getShell(config, params, inputFilePath)

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

