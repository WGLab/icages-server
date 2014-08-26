class UploadController < ApplicationController 
  protect_from_forgery except: :handle_upload
  before_filter :add_headers, :only => [:handle_upload, :options]
  #Thread::abort_on_exception = true

  def index
  end

  def options
    head :ok
  end
    

  def handle_upload

    inputData = params[:inputData]

    inputFile = params[:inputFile]

    email = params[:email] || ''
    
    logger.debug "Input file is [#{'empty' if inputFile.nil?}].." 

    email_msg = email.empty? ? '':'for ' + email

    if inputData
      submission = Submission.create(done: false, email: email)
      t = Thread.new { exec_query(submission.id, inputData, {isFile: false}) }
      render json: {id: submission.id, msg:"Submission: #{submission.id} created #{email_msg} url: #{result_path(submission, only_path: false)}"}
    elsif inputFile
      submission = Submission.create(done: false, email: email)
      t = Thread.new { exec_query(submission.id, inputFile, {isFile: true}) }
      render json: {id: submission.id, msg: "File: #{inputFile.original_filename} uploaded, Submission: #{submission.id} created #{email_msg}"}
    end
    
  end

  private 
  
  def exec_query(id, data, opts)
    working_dir = Rails.root
    config = CONFIG['script']
    File.open(CONFIG['script']['input_dir'] + "-id.txt",'w') do |file|
      file.write(opts[:isFile] ? data.read : data)
    end
   
    `perl #{config['path']} -i #{id} #{config['input_dir']} #{config['output_dir']} #{config['temp_dir']} #{config['log_dir']}`
   
    ActiveRecord::Base.connection_pool.with_connection do
	submission = Submission.find(id)
	submission.update(done: true)
        NotificationMailer.job_done(submission).deliver unless submission.email.empty?
    end

  end

  def add_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST OPTIONS'
    headers['Access-Control-Request-Method'] = '*'
    headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  end
end
