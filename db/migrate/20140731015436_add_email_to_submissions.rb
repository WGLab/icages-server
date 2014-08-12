class AddEmailToSubmissions < ActiveRecord::Migration
  def change
    add_column :submissions, :email, :string
  end
end
