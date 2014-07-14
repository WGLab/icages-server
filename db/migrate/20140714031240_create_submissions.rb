class CreateSubmissions < ActiveRecord::Migration
  def change
    create_table :submissions do |t|
      t.boolean :done

      t.timestamps
    end
  end
end
